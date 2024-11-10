import React, { useState } from "react";
import axios from "axios";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js";
import './App.css';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);
function App() {
  const [url, setUrl] = useState("");
  const [numWords, setNumWords] = useState(10);
  const [data, setData] = useState([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setData([]);
    setIsLoading(true);
    try {
      const response = await axios.post("http://127.0.0.1:5000/api/fetch-words", { url, numWords });
      setData(response.data.words);
    } catch (error) {
      setError("An error occurred while fetching data. Please check the URL and try again.");
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const chartData = {
    labels: data.map(item => item.word),
    datasets: [
      {
        label: 'Word Frequency',
        data: data.map(item => item.frequency),
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Word Frequency Chart',
      },
    },
  };
  return (
    <div className="App">
      <header className="App-header">
        <h1>Word Frequency Analyzer</h1>
        <p className="description">Discover the most frequent words on any webpage</p>
      </header>
      <main className="App-main">
        <form onSubmit={handleSubmit} className="url-form">
          <div className="input-group">
            <label htmlFor="url-input">Website URL</label>
            <input
              id="url-input"
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
              required
              className="url-input"
            />
          </div>
          <div className="input-group">
            <label htmlFor="num-words-input">Number of Words</label>
            <input
              id="num-words-input"
              type="number"
              value={numWords}
              onChange={(e) => setNumWords(e.target.value)}
              min="1"
              max="100"
              className="num-words-input"
            />
          </div>
          <button type="submit" className="submit-button" disabled={isLoading}>
            {isLoading ? 'Analyzing...' : 'Analyze'}
          </button>
        </form>

        {error && <p className="error-message">{error}</p>}

        {isLoading && (
          <div className="loading-message">
            <div className="loader"></div>
            <span>Analyzing webpage content...</span>
          </div>
        )}

        {data.length > 0 && (
          <div className="results-container">
            <h2>Top {numWords} Words</h2>
            <div className="chart-container">
              <Bar data={chartData} options={chartOptions} />
            </div>
            <div className="table-container">
              <table className="word-frequency-table">
                <thead>
                  <tr>
                    <th>Rank</th>
                    <th>Word</th>
                    <th>Frequency</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map(({ word, frequency }, index) => (
                    <tr key={index}>
                      <td>{index + 1}</td>
                      <td>{word}</td>
                      <td>{frequency}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;