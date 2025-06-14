import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { Calendar, TrendingUp, MessageSquare, Users, Building, BookOpen, HelpCircle, Filter, RefreshCw } from 'lucide-react';

const API_BASE_URL = 'http://localhost:8000';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [feedbackData, setFeedbackData] = useState([]);
  const [trends, setTrends] = useState(null);
  const [sentimentByTopic, setSentimentByTopic] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    sentiment: '',
    topic: '',
    startDate: '',
    endDate: '',
    page: 1
  });

  const COLORS = {
    Positive: '#10B981',
    Neutral: '#F59E0B',
    Negative: '#EF4444',
    Lecturer: '#3B82F6',
    'Training Program': '#8B5CF6',
    Facility: '#06B6D4',
    Others: '#6B7280'
  };

  const SENTIMENT_OPTIONS = [
    { value: '', label: 'All Sentiments' },
    { value: '2', label: 'Positive' },
    { value: '1', label: 'Neutral' },
    { value: '0', label: 'Negative' }
  ];

  const TOPIC_OPTIONS = [
    { value: '', label: 'All Topics' },
    { value: '0', label: 'Lecturer' },
    { value: '1', label: 'Training Program' },
    { value: '2', label: 'Facility' },
    { value: '3', label: 'Others' }
  ];

  const fetchStats = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/feedback/stats`);
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchFeedbackData = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.sentiment) params.append('sentiment', filters.sentiment);
      if (filters.topic) params.append('topic', filters.topic);
      if (filters.startDate) params.append('start_date', filters.startDate);
      if (filters.endDate) params.append('end_date', filters.endDate);
      params.append('page', filters.page.toString());
      params.append('limit', '20');

      const response = await fetch(`${API_BASE_URL}/api/feedback/data?${params}`);
      const data = await response.json();
      setFeedbackData(data);
    } catch (error) {
      console.error('Error fetching feedback data:', error);
    }
  };

  const fetchTrends = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/feedback/trends?days=30`);
      const data = await response.json();
      setTrends(data);
    } catch (error) {
      console.error('Error fetching trends:', error);
    }
  };

  const fetchSentimentByTopic = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/feedback/sentiment-by-topic`);
      const data = await response.json();
      setSentimentByTopic(data.data);
    } catch (error) {
      console.error('Error fetching sentiment by topic:', error);
    }
  };

  const loadAllData = async () => {
    setLoading(true);
    await Promise.all([
      fetchStats(),
      fetchFeedbackData(),
      fetchTrends(),
      fetchSentimentByTopic()
    ]);
    setLoading(false);
  };

  useEffect(() => {
    loadAllData();
  }, []);

  useEffect(() => {
    fetchFeedbackData();
  }, [filters]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
  };

  const StatCard = ({ title, value, icon: Icon, color }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <RefreshCw className="h-6 w-6 animate-spin text-blue-600" />
          <span className="text-lg font-medium text-gray-700">Loading dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Feedback Analytics Dashboard</h1>
              <p className="mt-1 text-sm text-gray-500">Student feedback analysis and insights</p>
            </div>
            <button
              onClick={loadAllData}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              title="Total Feedback"
              value={stats.total_feedback?.toLocaleString() || 0}
              icon={MessageSquare}
              color="bg-blue-600"
            />
            <StatCard
              title="Recent (7 days)"
              value={stats.recent_feedback?.toLocaleString() || 0}
              icon={TrendingUp}
              color="bg-green-600"
            />
            <StatCard
              title="Positive Sentiment"
              value={`${((stats.sentiment_distribution?.find(s => s.sentiment === 'Positive')?.count || 0) / stats.total_feedback * 100).toFixed(1)}%`}
              icon={Users}
              color="bg-emerald-600"
            />
            <StatCard
              title="Latest Update"
              value="Real-time"
              icon={Calendar}
              color="bg-purple-600"
            />
          </div>
        )}

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Sentiment Distribution */}
          {stats && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Sentiment Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={stats.sentiment_distribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ sentiment, count, percent }) => `${sentiment}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {stats.sentiment_distribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[entry.sentiment]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Topic Distribution */}
          {stats && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Topic Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stats.topic_distribution}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="topic" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#3B82F6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Sentiment by Topic Chart */}
        {sentimentByTopic.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Sentiment Analysis by Topic</h3>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={sentimentByTopic}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="topic" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="Positive" stackId="a" fill={COLORS.Positive} />
                <Bar dataKey="Neutral" stackId="a" fill={COLORS.Neutral} />
                <Bar dataKey="Negative" stackId="a" fill={COLORS.Negative} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Trends Chart */}
        {trends && trends.sentiment_trends.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Sentiment Trends (Last 30 Days)</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trends.sentiment_trends.slice(-15)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="Positive" stroke={COLORS.Positive} strokeWidth={2} />
                <Line type="monotone" dataKey="Neutral" stroke={COLORS.Neutral} strokeWidth={2} />
                <Line type="monotone" dataKey="Negative" stroke={COLORS.Negative} strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Feedback Data Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <h3 className="text-lg font-semibold text-gray-800">Feedback Data</h3>
              
              {/* Filters */}
              <div className="flex flex-wrap gap-3">
                <select
                  value={filters.sentiment}
                  onChange={(e) => handleFilterChange('sentiment', e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {SENTIMENT_OPTIONS.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
                
                <select
                  value={filters.topic}
                  onChange={(e) => handleFilterChange('topic', e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {TOPIC_OPTIONS.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
                
                <input
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => handleFilterChange('startDate', e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                
                <input
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => handleFilterChange('endDate', e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Feedback</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sentiment</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Topic</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created At</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {feedbackData.data?.map((feedback) => (
                  <tr key={feedback.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {feedback.id}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                      {feedback.feedback}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        feedback.sentiment === 'Positive' ? 'bg-green-100 text-green-800' :
                        feedback.sentiment === 'Neutral' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {feedback.sentiment}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {feedback.topic}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {feedback.created_at ? new Date(feedback.created_at).toLocaleString() : 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {feedbackData.total_pages > 1 && (
            <div className="px-6 py-3 border-t border-gray-200 flex items-center justify-between">
              <div className="text-sm text-gray-500">
                Showing {((feedbackData.page - 1) * 20) + 1} to {Math.min(feedbackData.page * 20, feedbackData.total)} of {feedbackData.total} results
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleFilterChange('page', Math.max(1, feedbackData.page - 1))}
                  disabled={feedbackData.page === 1}
                  className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => handleFilterChange('page', Math.min(feedbackData.total_pages, feedbackData.page + 1))}
                  disabled={feedbackData.page === feedbackData.total_pages}
                  className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;