import { useState } from "react";
import axios from "axios";
import { apiUrl } from "../lib/utils";

export default function CropPredictForm() {
  const [formData, setFormData] = useState({
    N: "", P: "", K: "", temperature: "", humidity: "", ph: "", rainfall: ""
  });
  const [result, setResult] = useState("");

  const handleChange = (e) => {
    setFormData({...formData, [e.target.name]: e.target.value});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(apiUrl("/api/crop/predict-crop"), {
        ...formData,
        N: parseFloat(formData.N),
        P: parseFloat(formData.P),
        K: parseFloat(formData.K),
        temperature: parseFloat(formData.temperature),
        humidity: parseFloat(formData.humidity),
        ph: parseFloat(formData.ph),
        rainfall: parseFloat(formData.rainfall),
      });
      setResult(res.data.predicted_crop);
    } catch (err) {
      alert("Prediction failed.");
    }
  };

  return (
    <div className="max-w-xl mx-auto p-4 shadow-xl rounded-xl bg-white">
      <h2 className="text-xl font-bold mb-4">Crop Prediction</h2>
      <form onSubmit={handleSubmit} className="space-y-3">
        {Object.keys(formData).map((key) => (
          <div key={key}>
            <label className="block mb-1 capitalize">{key}</label>
            <input
              name={key}
              value={formData[key]}
              onChange={handleChange}
              type="number"
              step="any"
              required
              className="w-full px-3 py-2 border rounded"
            />
          </div>
        ))}
        <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded">Predict</button>
      </form>
      {result && (
        <div className="mt-4 text-lg text-green-700">
          Recommended Crop: <strong>{result}</strong>
        </div>
      )}
    </div>
  );
} 