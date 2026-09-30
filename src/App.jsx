import { useMemo, useState } from "react";
import {
  AlertTriangle,
  BarChart3,
  CalendarClock,
  CheckCircle2,
  Coffee,
  Package,
  ShoppingCart,
  TrendingUp,
  Utensils,
} from "lucide-react";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import "./App.css";

/* =========================
   CAFÉ INVENTORY DATA
========================= */

const inventory = [
  {
    id: 1,
    name: "Fresh Milk",
    category: "Dairy",
    stock: 18,
    unit: "L",
    dailyDemand: 7,
    leadTime: 1,
    expiryDays: 2,
    price: 62,
  },
  {
    id: 2,
    name: "Fresh Cream",
    category: "Dairy",
    stock: 8,
    unit: "L",
    dailyDemand: 2,
    leadTime: 2,
    expiryDays: 3,
    price: 280,
  },
  {
    id: 3,
    name: "Bread",
    category: "Bakery",
    stock: 25,
    unit: "packs",
    dailyDemand: 6,
    leadTime: 2,
    expiryDays: 2,
    price: 45,
  },
  {
    id: 4,
    name: "Tomatoes",
    category: "Vegetables",
    stock: 12,
    unit: "kg",
    dailyDemand: 3,
    leadTime: 2,
    expiryDays: 4,
    price: 90,
  },
  {
    id: 5,
    name: "Coffee Beans",
    category: "Beverages",
    stock: 15,
    unit: "kg",
    dailyDemand: 1.5,
    leadTime: 4,
    expiryDays: 30,
    price: 850,
  },
  {
    id: 6,
    name: "Cheese",
    category: "Dairy",
    stock: 10,
    unit: "kg",
    dailyDemand: 2,
    leadTime: 3,
    expiryDays: 6,
    price: 420,
  },
  {
    id: 7,
    name: "Eggs",
    category: "Dairy",
    stock: 120,
    unit: "pcs",
    dailyDemand: 20,
    leadTime: 2,
    expiryDays: 5,
    price: 8,
  },
  {
    id: 8,
    name: "Chicken",
    category: "Meat",
    stock: 14,
    unit: "kg",
    dailyDemand: 4,
    leadTime: 2,
    expiryDays: 3,
    price: 260,
  },
  {
    id: 9,
    name: "Onions",
    category: "Vegetables",
    stock: 25,
    unit: "kg",
    dailyDemand: 2,
    leadTime: 3,
    expiryDays: 8,
    price: 55,
  },
  {
    id: 10,
    name: "Potatoes",
    category: "Vegetables",
    stock: 30,
    unit: "kg",
    dailyDemand: 4,
    leadTime: 3,
    expiryDays: 10,
    price: 45,
  },
  {
    id: 11,
    name: "Chocolate Syrup",
    category: "Beverages",
    stock: 8,
    unit: "L",
    dailyDemand: 0.5,
    leadTime: 5,
    expiryDays: 45,
    price: 350,
  },
  {
    id: 12,
    name: "Strawberries",
    category: "Fruits",
    stock: 6,
    unit: "kg",
    dailyDemand: 2,
    leadTime: 2,
    expiryDays: 2,
    price: 320,
  },
];

/* =========================
   PREDICTION ENGINE
========================= */

function getPrediction(item) {
  const leadTimeDemand = item.dailyDemand * item.leadTime;

  const safetyStock = Math.ceil(item.dailyDemand * 2);

  const reorderPoint = Math.ceil(
    leadTimeDemand + safetyStock
  );

  const daysRemaining =
    item.dailyDemand > 0
      ? Math.floor(item.stock / item.dailyDemand)
      : 0;

  let risk = "Healthy";

  if (item.stock <= reorderPoint) {
    risk = "High";
  } else if (item.stock <= reorderPoint * 1.5) {
    risk = "Medium";
  }

  const targetStock =
    Math.ceil(item.dailyDemand * 7 + safetyStock);

  const recommendedOrder = Math.max(
    0,
    targetStock - item.stock
  );

  const estimatedWaste =
    item.expiryDays <= daysRemaining
      ? Math.max(
          0,
          Math.floor(
            item.stock -
              item.dailyDemand * item.expiryDays
          )
        )
      : 0;

  const wasteValue = Math.round(
    estimatedWaste * item.price
  );

  return {
    ...item,
    leadTimeDemand,
    safetyStock,
    reorderPoint,
    daysRemaining,
    risk,
    targetStock,
    recommendedOrder,
    estimatedWaste,
    wasteValue,
  };
}

function riskClass(risk) {
  return risk.toLowerCase();
}

function App() {
  const [selectedId, setSelectedId] = useState(1);
  const [filter, setFilter] = useState("All");

  const predictions = useMemo(
    () => inventory.map(getPrediction),
    []
  );

  const selectedItem =
    predictions.find(
      (item) => item.id === selectedId
    ) || predictions[0];

  const filteredInventory =
    filter === "All"
      ? predictions
      : predictions.filter(
          (item) => item.risk === filter
        );

  const highRisk = predictions.filter(
    (item) => item.risk === "High"
  ).length;

  const mediumRisk = predictions.filter(
    (item) => item.risk === "Medium"
  ).length;

  const healthyRisk = predictions.filter(
    (item) => item.risk === "Healthy"
  ).length;

  const totalUnits = predictions.reduce(
    (sum, item) => sum + item.stock,
    0
  );

  const totalReorderUnits = predictions.reduce(
    (sum, item) => sum + item.recommendedOrder,
    0
  );

  const reorderValue = predictions.reduce(
    (sum, item) =>
      sum + item.recommendedOrder * item.price,
    0
  );

  const criticalItem = [...predictions].sort(
    (a, b) => a.daysRemaining - b.daysRemaining
  )[0];

  const chartData = predictions.slice(0, 8).map(
    (item) => ({
      name: item.name.split(" ")[0],
      Stock: item.stock,
      "Daily Demand": item.dailyDemand,
    })
  );

  const healthData = [
    {
      name: "Healthy",
      value: healthyRisk,
    },
    {
      name: "Medium",
      value: mediumRisk,
    },
    {
      name: "High",
      value: highRisk,
    },
  ];

  const healthColors = [
    "#16a34a",
    "#f59e0b",
    "#ef4444",
  ];

  return (
    <div className="app">

      {/* ================= HEADER ================= */}

      <header className="topbar">
        <div className="brand">
          <div className="brand-icon">
            <Coffee size={25} />
          </div>

          <div>
            <h1>StockSense</h1>
            <p>Smart Café Inventory</p>
          </div>
        </div>

        <div className="status">
          <span className="status-dot"></span>
          Prediction engine active
        </div>
      </header>

      <main className="container">

        {/* ================= HERO ================= */}

        <section className="hero">

          <div className="hero-content">

            <div className="eyebrow">
              SMART INVENTORY COMMAND CENTER
            </div>

            <h2>
              Know what will run out
              <br />
              before your café runs out.
            </h2>

            <p>
              Predict ingredient stockouts, understand
              the reason behind each risk and get smart
              reorder recommendations.
            </p>

          </div>

          <div className="critical-card">

            <span>Next critical stockout</span>

            <div className="critical-name">
              <CalendarClock size={27} />

              <strong>
                {criticalItem.name}
              </strong>
            </div>

            <p>
              Runs out in{" "}
              <strong>
                {criticalItem.daysRemaining}{" "}
                {criticalItem.daysRemaining === 1
                  ? "day"
                  : "days"}
              </strong>
            </p>

          </div>

        </section>

        {/* ================= STATS ================= */}

        <section className="stats-grid">

          <div className="stat-card">

            <div className="stat-icon blue">
              <Package size={23} />
            </div>

            <div>
              <span>Total inventory</span>
              <strong>
                {totalUnits} units
              </strong>
            </div>

          </div>

          <div className="stat-card">

            <div className="stat-icon red">
              <AlertTriangle size={23} />
            </div>

            <div>
              <span>High stockout risk</span>
              <strong>{highRisk}</strong>
            </div>

          </div>

          <div className="stat-card">

            <div className="stat-icon orange">
              <TrendingUp size={23} />
            </div>

            <div>
              <span>Reorder units</span>
              <strong>
                {totalReorderUnits}
              </strong>
            </div>

          </div>

          <div className="stat-card">

            <div className="stat-icon green">
              <ShoppingCart size={23} />
            </div>

            <div>
              <span>Reorder value</span>
              <strong>
                ₹{reorderValue.toLocaleString("en-IN")}
              </strong>
            </div>

          </div>

        </section>

        {/* ================= MAIN DASHBOARD ================= */}

        <section className="dashboard-grid">

          {/* INVENTORY TABLE */}

          <div className="panel">

            <div className="panel-header">

              <div>
                <h3>Stockout Risk Monitor</h3>

                <p>
                  Ingredients ranked by predicted
                  stockout risk
                </p>
              </div>

              <select
                value={filter}
                onChange={(e) =>
                  setFilter(e.target.value)
                }
              >
                <option value="All">All</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Healthy">
                  Healthy
                </option>
              </select>

            </div>

            <div className="inventory-table">

              <div className="table-head">
                <span>INGREDIENT</span>
                <span>STOCK</span>
                <span>DAILY DEMAND</span>
                <span>RUNS OUT</span>
                <span>RISK</span>
              </div>

              {filteredInventory.map((item) => (

                <div
                  key={item.id}
                  className={`table-row ${
                    selectedId === item.id
                      ? "selected-product"
                      : ""
                  }`}
                  onClick={() =>
                    setSelectedId(item.id)
                  }
                >

                  <div className="product-cell">

                    <div className="product-icon">
                      <Utensils size={18} />
                    </div>

                    <div>
                      <strong>
                        {item.name}
                      </strong>

                      <small>
                        {item.category}
                      </small>
                    </div>

                  </div>

                  <span>
                    {item.stock} {item.unit}
                  </span>

                  <span>
                    {item.dailyDemand} {item.unit}/day
                  </span>

                  <span>
                    {item.daysRemaining} days
                  </span>

                  <span
                    className={`risk ${riskClass(
                      item.risk
                    )}`}
                  >

                    {item.risk === "High" && (
                      <AlertTriangle size={14} />
                    )}

                    {item.risk === "Medium" && (
                      <CalendarClock size={14} />
                    )}

                    {item.risk === "Healthy" && (
                      <CheckCircle2 size={14} />
                    )}

                    {item.risk}

                  </span>

                </div>

              ))}

            </div>

          </div>

          {/* PREDICTION PANEL */}

          <div className="panel prediction-panel">

            <div className="panel-header">

              <div>
                <h3>Prediction Insight</h3>

                <p>
                  Selected ingredient analysis
                </p>
              </div>

              <BarChart3 size={23} />

            </div>

            <div className="selected-product-header">

              <div className="big-product-icon">
                <Coffee size={30} />
              </div>

              <div>
                <h2>
                  {selectedItem.name}
                </h2>

                <p>
                  {selectedItem.category}
                </p>
              </div>

            </div>

            {/* RISK */}

            <div className="prediction-risk-row">

              <div>
                <span>STOCKOUT RISK</span>

                <strong
                  className={riskClass(
                    selectedItem.risk
                  )}
                >
                  {selectedItem.risk.toUpperCase()}
                </strong>
              </div>

              <div className="days-number">

                {selectedItem.daysRemaining}

                <small>
                  days left
                </small>

              </div>

            </div>

            {/* METRICS */}

            <div className="metrics">

              <div>
                <span>Current stock</span>

                <strong>
                  {selectedItem.stock}{" "}
                  {selectedItem.unit}
                </strong>
              </div>

              <div>
                <span>Daily demand</span>

                <strong>
                  {selectedItem.dailyDemand}{" "}
                  {selectedItem.unit}
                </strong>
              </div>

              <div>
                <span>Supplier lead time</span>

                <strong>
                  {selectedItem.leadTime} days
                </strong>
              </div>

              <div>
                <span>Reorder point</span>

                <strong>
                  {selectedItem.reorderPoint}{" "}
                  {selectedItem.unit}
                </strong>
              </div>

            </div>

            {/* EXPLANATION */}

            <div className="explanation">

              <div className="explanation-title">

                <AlertTriangle size={17} />

                Why is this at risk?

              </div>

              <p>

                The café uses approximately{" "}
                <strong>
                  {selectedItem.dailyDemand}{" "}
                  {selectedItem.unit}
                </strong>{" "}
                per day. At the current stock level,
                inventory may last only{" "}
                <strong>
                  {selectedItem.daysRemaining} days.
                </strong>

              </p>

            </div>

            {/* REORDER */}

            <div className="recommendation">

              <div className="recommendation-icon">
                <ShoppingCart size={23} />
              </div>

              <div>

                <span>
                  SMART REORDER RECOMMENDATION
                </span>

                <strong>
                  Order{" "}
                  {selectedItem.recommendedOrder}{" "}
                  {selectedItem.unit}
                </strong>

                <small>
                  Based on demand, supplier lead time
                  and safety stock.
                </small>

              </div>

            </div>

            {/* EXPIRY WARNING */}

            {selectedItem.expiryDays <=
              selectedItem.daysRemaining && (

              <div className="expiry-warning">

                <CalendarClock size={18} />

                <div>

                  <strong>
                    Expiry warning
                  </strong>

                  <p>
                    This ingredient expires in{" "}
                    {selectedItem.expiryDays} days.
                    Use the existing batch before
                    placing another large order.
                  </p>

                </div>

              </div>

            )}

          </div>

        </section>

        {/* ================= CHARTS ================= */}

        <section className="charts-grid">

          <div className="panel chart-panel">

            <div className="panel-header">

              <div>
                <h3>
                  Demand vs Current Stock
                </h3>

                <p>
                  Daily demand compared with available
                  ingredient inventory
                </p>
              </div>

            </div>

            <div className="chart-container">

              <ResponsiveContainer
                width="100%"
                height={300}
              >

                <BarChart data={chartData}>

                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                  />

                  <XAxis dataKey="name" />

                  <YAxis />

                  <Tooltip />

                  <Bar
                    dataKey="Stock"
                    fill="#1d4ed8"
                    radius={[6, 6, 0, 0]}
                  />

                  <Bar
                    dataKey="Daily Demand"
                    fill="#f59e0b"
                    radius={[6, 6, 0, 0]}
                  />

                </BarChart>

              </ResponsiveContainer>

            </div>

          </div>

          <div className="panel chart-panel">

            <div className="panel-header">

              <div>
                <h3>
                  Inventory Health
                </h3>

                <p>
                  Current stockout risk distribution
                </p>
              </div>

              <CheckCircle2 size={23} />

            </div>

            <div className="pie-wrapper">

              <ResponsiveContainer
                width="100%"
                height={260}
              >

                <PieChart>

                  <Pie
                    data={healthData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={95}
                    paddingAngle={4}
                  >

                    {healthData.map(
                      (entry, index) => (

                        <Cell
                          key={`cell-${index}`}
                          fill={
                            healthColors[index]
                          }
                        />

                      )
                    )}

                  </Pie>

                  <Tooltip />

                </PieChart>

              </ResponsiveContainer>

              <div className="legend">

                <div>
                  <span
                    className="legend-dot"
                    style={{
                      background: "#16a34a",
                    }}
                  />

                  Healthy

                  <strong>
                    {healthyRisk}
                  </strong>
                </div>

                <div>
                  <span
                    className="legend-dot"
                    style={{
                      background: "#f59e0b",
                    }}
                  />

                  Medium

                  <strong>
                    {mediumRisk}
                  </strong>
                </div>

                <div>
                  <span
                    className="legend-dot"
                    style={{
                      background: "#ef4444",
                    }}
                  />

                  High

                  <strong>
                    {highRisk}
                  </strong>
                </div>

              </div>

            </div>

          </div>

        </section>

        {/* ================= BUSINESS EXPLANATION ================= */}

        <section className="business-banner">

          <div className="business-icon">
            <Coffee size={25} />
          </div>

          <div>

            <strong>
              Built for small cafés and restaurants
            </strong>

            <p>
              StockSense predicts ingredient stockouts
              before they happen and recommends when
              and how much to reorder.
            </p>

          </div>

        </section>

      </main>

      <footer>

        <span>
          StockSense — Smart Inventory MVP
        </span>

        <span>
          Predict • Explain • Act
        </span>

      </footer>

    </div>
  );
}

export default App;