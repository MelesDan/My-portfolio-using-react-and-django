from collections import defaultdict

from catalog.models import Product
from recommendations.models import Interaction


def get_trending_products(limit=6):
    return Product.objects.filter(is_active=True).order_by("-units_sold", "-is_featured", "name")[:limit]


def get_recommendations_for_user(user, limit=6):
    interactions = (
        Interaction.objects.filter(user=user)
        .select_related("product", "product__category")
        .order_by("-created_at")[:50]
    )
    if not interactions:
        return get_trending_products(limit)

    weights = {
        Interaction.Action.VIEW: 1,
        Interaction.Action.SEARCH: 1,
        Interaction.Action.CART: 2,
        Interaction.Action.PURCHASE: 4,
    }
    scores = defaultdict(int)
    seen_product_ids = set()

    for interaction in interactions:
        if not interaction.product:
            continue
        seen_product_ids.add(interaction.product_id)
        base_score = weights.get(interaction.action, 1)
        candidates = Product.objects.filter(
            is_active=True,
            category=interaction.product.category,
        ).exclude(id=interaction.product_id)
        for candidate in candidates[:12]:
            scores[candidate.id] += base_score * 3
            if candidate.brand == interaction.product.brand:
                scores[candidate.id] += 2

    ordered_ids = [
        product_id
        for product_id, _ in sorted(scores.items(), key=lambda item: item[1], reverse=True)
        if product_id not in seen_product_ids
    ]
    if ordered_ids:
        preserved_order = {product_id: index for index, product_id in enumerate(ordered_ids)}
        products = list(Product.objects.filter(id__in=ordered_ids, is_active=True).select_related("category"))
        products.sort(key=lambda product: preserved_order[product.id])
    else:
        products = []

    if len(products) < limit:
        fallback = [
            product
            for product in get_trending_products(limit * 2)
            if product.id not in {item.id for item in products}
        ]
        products.extend(fallback)

    return products[:limit]
