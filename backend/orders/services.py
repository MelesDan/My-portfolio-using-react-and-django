import uuid
from datetime import timedelta

from django.db import transaction
from django.utils import timezone

from core.utils import log_activity
from orders.models import CartItem, Order, OrderItem, Payment
from recommendations.models import Interaction


def create_order_from_cart(user, shipping_address, payment_method, notes=""):
    cart_items = list(CartItem.objects.select_related("product").filter(user=user))
    if not cart_items:
        raise ValueError("Your cart is empty.")

    for item in cart_items:
        if item.quantity > item.product.stock_qty:
            raise ValueError(f"Only {item.product.stock_qty} units left for {item.product.name}.")

    total = sum(item.quantity * item.product.price for item in cart_items)
    with transaction.atomic():
        order = Order.objects.create(
            user=user,
            shipping_address=shipping_address,
            payment_method=payment_method,
            total_amount=total,
            notes=notes,
            estimated_delivery=timezone.localdate() + timedelta(days=4),
        )
        OrderItem.objects.bulk_create(
            [
                OrderItem(
                    order=order,
                    product=item.product,
                    product_name=item.product.name,
                    quantity=item.quantity,
                    price_at_sale=item.product.price,
                )
                for item in cart_items
            ]
        )
        Payment.objects.create(
            order=order,
            tx_ref=f"CHAPA-{uuid.uuid4().hex[:12].upper()}",
            method=payment_method,
        )
        CartItem.objects.filter(user=user).delete()
    return order


def simulate_payment(order, acting_user, success=True, method="telebirr"):
    with transaction.atomic():
        payment = order.payment
        payment.method = method
        payment.status = Payment.Status.SUCCESS if success else Payment.Status.FAILED
        payment.gateway_response = {
            "provider": "CHAPA",
            "mode": "sandbox",
            "success": success,
        }
        payment.verified_at = timezone.now()
        payment.save()

        if success and order.status == Order.Status.PENDING:
            for item in order.items.select_related("product"):
                if item.product:
                    if item.product.stock_qty < item.quantity:
                        raise ValueError(f"Insufficient stock for {item.product.name}.")
                    item.product.stock_qty -= item.quantity
                    item.product.units_sold += item.quantity
                    item.product.save(update_fields=["stock_qty", "units_sold", "updated_at"])
                    Interaction.objects.create(
                        user=order.user,
                        product=item.product,
                        action=Interaction.Action.PURCHASE,
                    )
            order.status = Order.Status.PAID
            order.save(update_fields=["status", "updated_at"])
            log_activity(acting_user, "payment_success", order, {"tx_ref": payment.tx_ref})
        elif not success:
            log_activity(acting_user, "payment_failed", order, {"tx_ref": payment.tx_ref})
    return order
