# Estructura del proyecto de Dashboard

dashboard/
├── src/
│ ├── components/
│ │ ├── layout/
│ │ │ ├── Sidebar.jsx
│ │ │ ├── Sidebar.css
│ │ │ ├── DashboardLayout.jsx
│ │ │ └── DashboardLayout.css
│ │ ├── ui/
│ │ │ ├── PageHeader.jsx
│ │ │ └── PageHeader.css
│ │ └── ProtectedRoute.jsx
│ ├── context/
│ │ └── AuthContext.jsx
│ ├── pages/
│ │ ├── Login.jsx
│ │ ├── Login.css
│ │ ├── AgendaHome.jsx
│ │ ├── Schedule.jsx
│ │ ├── Photos.jsx
│ │ ├── AdminBarbers.jsx
│ │ └── AdminFinance.jsx
│ ├── services/
│ │ ├── api.js
│ │ └── auth.js
│ ├── styles/
│ │ ├── tokens.css
│ │ └── base.css
│ ├── App.jsx
│ ├── main.jsx
│ └── index.css
├── vite.config.js
└── package.json
