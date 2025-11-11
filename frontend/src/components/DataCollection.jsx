import React, { useState, useEffect } from "react";
import api from "../api"; // will be used in future for fetching forms/responses
import { useAuth } from "@clerk/clerk-react";

export default function DataCollection() {
  const [activeTab, setActiveTab] = useState("forms");
  const [forms, setForms] = useState([]);
  const [analytics, setAnalytics] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [hoveredForm, setHoveredForm] = useState(null);
  const [hoveredMetric, setHoveredMetric] = useState(null);
  const [hoveredResponse, setHoveredResponse] = useState(null);
  const [responses, setResponses] = useState([]); // kept for API integration

  const [newForm, setNewForm] = useState({
    title: "",
    description: "",
    questions: [{ questionText: "", questionType: "text", required: false }],
  });

  // Sample data for UI
  const sampleForms = [
    {
      _id: 1,
      title: "Volunteer Feedback Survey",
      description:
        "Collect feedback from volunteers about their experience and satisfaction",
      analytics: { totalResponses: 24, averageRating: 4.2, completionRate: "85%" },
      created: "2024-01-15",
    },
    {
      _id: 2,
      title: "Beneficiary Impact Assessment",
      description:
        "Measure the impact of our programs on beneficiaries and communities",
      analytics: { totalResponses: 156, averageRating: 8.7, completionRate: "92%" },
      created: "2024-01-10",
    },
    {
      _id: 3,
      title: "Community Needs Assessment",
      description:
        "Identify current needs and priorities in the community for future planning",
      analytics: { totalResponses: 89, averageRating: 4.5, completionRate: "78%" },
      created: "2024-01-05",
    },
  ];

  const sampleAnalytics = {
    formAnalytics: {
      totalForms: 3,
      totalResponses: 269,
      averageRating: 7.8,
      completionRate: "85%",
    },
    responseTrends: [
      { date: "2024-01-01", count: 12 },
      { date: "2024-01-02", count: 18 },
      { date: "2024-01-03", count: 15 },
      { date: "2024-01-04", count: 22 },
    ],
    insights: [
      "Volunteer satisfaction increased by 15% this quarter",
      "Beneficiary impact scores show 92% positive outcomes",
      "Community needs shifting toward education and healthcare",
    ],
  };

  // Example: simulate fetching data with api
  const { getToken, isLoaded } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Try to retrieve a Clerk token and use it for authenticated requests.
        let token = null;
        try {
          if (isLoaded && typeof getToken === "function") {
            token = await getToken();
          }
        } catch (e) {
          console.warn("Clerk getToken failed", e);
        }

        if (token) {
          try {
            const formsRes = await api.get("/forms", { headers: { Authorization: `Bearer ${token}` } });
            setForms(formsRes.data);
            const responsesRes = await api.get("/responses", { headers: { Authorization: `Bearer ${token}` } });
            setResponses(responsesRes.data);
            const analyticsRes = await api.get("/analytics", { headers: { Authorization: `Bearer ${token}` } });
            setAnalytics(analyticsRes.data);
            setIsLoading(false);
            return; // done
          } catch (err) {
            console.warn("Authenticated API fetch failed, falling back to sample data", err);
          }
        }

        // Fallback to sample data when no token or API fails
        setForms(sampleForms);
        setAnalytics(sampleAnalytics);
      } catch (err) {
        console.error("Failed to fetch data", err);
        setForms(sampleForms);
        setAnalytics(sampleAnalytics);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded]);

  const addQuestion = () => {
    setNewForm((prev) => ({
      ...prev,
      questions: [
        ...prev.questions,
        { questionText: "", questionType: "text", required: false },
      ],
    }));
  };

  const handleCreateForm = () => {
    if (!newForm.title.trim()) return alert("Please enter a form title");
    setForms((prev) => [
      {
        ...newForm,
        _id: Date.now(),
        analytics: { totalResponses: 0, averageRating: 0, completionRate: "0%" },
      },
      ...prev,
    ]);
    setNewForm({
      title: "",
      description: "",
      questions: [{ questionText: "", questionType: "text", required: false }],
    });
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "forms":
        return (
          <>
            {/* Create Form */}
            <div className="bg-gray-50 rounded-xl p-6 mb-6">
              <h3 className="text-lg font-semibold mb-2">Create New Form</h3>
              <input
                className="w-full p-3 border-2 border-gray-200 rounded-md mb-3 focus:border-blue-500 outline-none"
                placeholder="Form title"
                value={newForm.title}
                onChange={(e) =>
                  setNewForm((prev) => ({ ...prev, title: e.target.value }))
                }
              />
              <textarea
                className="w-full p-3 border-2 border-gray-200 rounded-md mb-3 focus:border-blue-500 outline-none"
                placeholder="Form description"
                value={newForm.description}
                onChange={(e) =>
                  setNewForm((prev) => ({ ...prev, description: e.target.value }))
                }
              />
              <button
                onClick={addQuestion}
                className="text-sm px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition mr-3"
              >
                + Add Question
              </button>
              <button
                onClick={handleCreateForm}
                className="text-sm px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
              >
                Create Form
              </button>
            </div>

            {/* List Forms */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {forms.map((form) => (
                <div
                  key={form._id}
                  onMouseEnter={() => setHoveredForm(form._id)}
                  onMouseLeave={() => setHoveredForm(null)}
                  className={`bg-white border-2 rounded-xl p-5 shadow transition cursor-pointer ${
                    hoveredForm === form._id
                      ? "border-blue-400 shadow-lg -translate-y-1"
                      : "border-gray-100"
                  }`}
                >
                  <h4 className="font-semibold text-slate-800 mb-2">{form.title}</h4>
                  <p className="text-sm text-gray-500 mb-3">{form.description}</p>
                  <div className="flex justify-between text-xs text-gray-600">
                    <span>📊 {form.analytics.totalResponses}</span>
                    <span>⭐ {form.analytics.averageRating}</span>
                    <span>🎯 {form.analytics.completionRate}</span>
                  </div>
                  <div className="text-[11px] text-gray-400 mt-3">
                    Created: {form.created}
                  </div>
                </div>
              ))}
            </div>
          </>
        );

      case "analytics":
        return (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
              {[
                { label: "Active Forms", value: analytics.formAnalytics?.totalForms, icon: "📝" },
                { label: "Total Responses", value: analytics.formAnalytics?.totalResponses, icon: "📊" },
                { label: "Avg Rating", value: analytics.formAnalytics?.averageRating, icon: "⭐" },
                { label: "Completion Rate", value: analytics.formAnalytics?.completionRate, icon: "🎯" },
              ].map((metric, index) => (
                <div
                  key={index}
                  onMouseEnter={() => setHoveredMetric(index)}
                  onMouseLeave={() => setHoveredMetric(null)}
                  className={`bg-white border-2 rounded-xl p-6 text-center shadow transition ${
                    hoveredMetric === index ? "shadow-lg -translate-y-1 border-blue-400" : "border-gray-100"
                  }`}
                >
                  <div className="text-2xl mb-2">{metric.icon}</div>
                  <div className="text-3xl font-bold text-blue-500">{metric.value}</div>
                  <div className="text-sm text-gray-600">{metric.label}</div>
                </div>
              ))}
            </div>

            {/* Insights */}
            <div className="bg-gray-50 p-5 rounded-lg">
              <h4 className="font-semibold mb-3">Key Insights</h4>
              <ul className="list-disc list-inside text-gray-600">
                {analytics.insights?.map((insight, i) => (
                  <li key={i} className="mb-1">{insight}</li>
                ))}
              </ul>
            </div>
          </>
        );

      case "responses":
        return (
          <div>
            {responses.length === 0 ? (
              <div className="text-center text-gray-500 p-10">No responses yet.</div>
            ) : (
              responses.map((r) => (
                <div
                  key={r._id}
                  onMouseEnter={() => setHoveredResponse(r._id)}
                  onMouseLeave={() => setHoveredResponse(null)}
                  className={`border-2 rounded-lg p-5 mb-3 transition ${
                    hoveredResponse === r._id ? "border-blue-400" : "border-gray-200"
                  }`}
                >
                  <div className="flex justify-between text-sm font-semibold text-slate-700 mb-2">
                    <span>Response #{r._id}</span>
                    <span>{new Date(r.submitted).toLocaleDateString()}</span>
                  </div>
                  <div className="text-sm text-gray-600 mb-3">
                    <strong>{r.respondent?.name}</strong> ({r.respondent?.email})
                  </div>
                </div>
              ))
            )}
          </div>
        );

      default:
        return null;
    }
  };

  if (isLoading) {
    return <div className="text-center p-20 text-gray-400">Loading...</div>;
  }

  return (
    <div className="bg-white rounded-2xl shadow p-6">
      <h2 className="text-2xl font-bold text-slate-800 text-center mb-6">
        📊 Data Collection & Analytics
      </h2>

      <div className="flex gap-2 bg-gray-100 p-2 rounded-lg mb-6 overflow-x-auto">
        {[
          { id: "forms", label: "📝 Forms Management" },
          { id: "analytics", label: "📈 Analytics Dashboard" },
          { id: "responses", label: "📋 Responses" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-md text-sm font-semibold transition ${
              activeTab === tab.id
                ? "bg-blue-500 text-white"
                : "hover:bg-gray-200 text-gray-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {renderTabContent()}
    </div>
  );
}
