# ElectroMart Ethiopia

This workspace turns the document `Web_Based_Electronics_Device_E_commerce_Manegement_System_Final.docx` into a real full-stack project with:

- `frontend/`: React + Vite customer storefront and admin dashboard
- `backend/`: Django REST API for authentication, catalog, cart, checkout, simulated payment, recommendations, and reporting

## What Was Mapped From The Documentation

The `.docx` described these main modules, and they are now represented in code:

- User authentication and profile management
- Product catalog with search and category filters
- Shopping cart and order processing
- Simulated CHAPA-style payment verification
- Recommendation engine based on browsing/cart/purchase interactions
- Administrative inventory and order management
- Sales dashboard and low-stock alerts

## Folder Structure

```text
backend/
  accounts/          custom user model, login, register, admin user control
  catalog/           categories, products, admin product management, demo seed command
  orders/            cart, checkout, payments, order history, admin order updates
  recommendations/   interaction logging and product recommendation logic
  dashboard/         admin metrics and reporting overview
  core/              shared models, permissions, audit logging

frontend/
  src/components/    navbar, layout, route guard, product card
  src/contexts/      auth state and persistent cart state
  src/pages/         home, catalog, detail, cart, checkout, orders, admin
  src/api/           API client used by React pages
```

## Backend Setup

1. Install Python 3.10+ and MySQL if you want MySQL for development.
2. Create a virtual environment inside `backend/`.
3. Install packages:

```bash
pip install -r requirements.txt
```

4. Copy `.env.example` to `.env` and set your database settings.
5. Run migrations:

```bash
python manage.py makemigrations
python manage.py migrate
```

6. Seed demo data:

```bash
python manage.py seed_store
```

7. Start Django:

```bash
python manage.py runserver
```

Default seeded admin:

- Email: `admin@electromart.et`
- Password: `Admin12345`

## Frontend Setup

1. Install Node.js 18+.
2. Inside `frontend/`, install packages:

```bash
npm install
```

3. Copy `.env.example` to `.env`.
4. Start the React app:

```bash
npm run dev
```

## Key API Endpoints

- `POST /api/auth/register/`
- `POST /api/auth/login/`
- `GET /api/catalog/products/`
- `GET /api/catalog/products/<slug>/`
- `GET /api/orders/cart/`
- `POST /api/orders/checkout/`
- `POST /api/orders/<order_reference>/pay/`
- `GET /api/recommendations/for-you/`
- `GET /api/dashboard/overview/`

## Notes

- The original document text was extracted into `document-text.txt` to map the required features before implementation.
- The payment flow is intentionally sandboxed to match the document's academic CHAPA simulation requirement.
- The backend is configured for MySQL through environment variables but can fall back to SQLite for local development.
- This workspace currently contains the project source, but I could not run Python, Django, or Node from the current shell environment because the toolchain is not exposed here.
