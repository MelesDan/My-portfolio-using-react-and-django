from django.core.management.base import BaseCommand

from accounts.models import User
from catalog.models import Category, Product


class Command(BaseCommand):
    help = "Seed the electronics storefront with sample categories, products, and an admin user."

    def handle(self, *args, **options):
        categories = {
            "Smartphones": "Latest Android and iPhone devices.",
            "Laptops": "Portable computing for work and study.",
            "Accessories": "Chargers, earbuds, cases, and adapters.",
            "Gaming": "Consoles, headsets, and performance gear.",
        }
        for name, description in categories.items():
            Category.objects.get_or_create(name=name, defaults={"description": description})

        samples = [
            {
                "category": "Smartphones",
                "name": "Samsung Galaxy A55",
                "sku": "PHN-SAM-A55",
                "brand": "Samsung",
                "price": "24000.00",
                "stock_qty": 18,
                "is_featured": True,
                "image_url": "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9",
                "description": "Reliable mid-range phone with vivid AMOLED display.",
                "specifications": {"display": "6.6 inch AMOLED", "storage": "128GB", "ram": "8GB"},
            },
            {
                "category": "Laptops",
                "name": "Lenovo IdeaPad Slim 5",
                "sku": "LAP-LEN-SLIM5",
                "brand": "Lenovo",
                "price": "58500.00",
                "stock_qty": 7,
                "is_featured": True,
                "image_url": "https://images.unsplash.com/photo-1496181133206-80ce9b88a853",
                "description": "Thin everyday laptop for students, coding, and office work.",
                "specifications": {"cpu": "Intel Core i5", "storage": "512GB SSD", "ram": "16GB"},
            },
            {
                "category": "Accessories",
                "name": "Anker 65W Fast Charger",
                "sku": "ACC-ANK-65W",
                "brand": "Anker",
                "price": "2500.00",
                "stock_qty": 34,
                "image_url": "https://images.unsplash.com/photo-1583394838336-acd977736f90",
                "description": "Compact charger for phones, tablets, and lightweight laptops.",
                "specifications": {"ports": "USB-C", "power": "65W", "plug": "EU"},
            },
            {
                "category": "Gaming",
                "name": "HyperX Cloud Stinger 2",
                "sku": "GAM-HYX-ST2",
                "brand": "HyperX",
                "price": "4600.00",
                "stock_qty": 12,
                "image_url": "https://images.unsplash.com/photo-1546435770-a3e426bf472b",
                "description": "Lightweight gaming headset with clean directional sound.",
                "specifications": {"mic": "Noise-cancelling", "audio": "50mm drivers", "connectivity": "3.5mm"},
            },
        ]

        for item in samples:
            category = Category.objects.get(name=item.pop("category"))
            Product.objects.get_or_create(category=category, sku=item["sku"], defaults=item)

        if not User.objects.filter(email="admin@electromart.et").exists():
            User.objects.create_superuser(
                email="admin@electromart.et",
                password="Admin12345",
                username="admin",
                full_name="System Administrator",
                address="Gondar, Ethiopia",
            )

        self.stdout.write(self.style.SUCCESS("Sample storefront data created."))
