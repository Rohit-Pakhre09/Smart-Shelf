import PropTypes from "prop-types";
import { useContext } from "react";
import { AppContext } from "../contexts/AppProvider";

const exportToCSV = (data, filename = "export.csv") => {

  if (!data || data.length === 0) {
    alert("No data available to export");
    return;
  }
  const headers = Object.keys(data[0]);
  const csvRows = [
    headers.join(","), // header row
    ...data.map((row) =>
      headers.map((field) => JSON.stringify(row[field] ?? "")).join(",")
    ),
  ];
  const csvContent = new Blob([csvRows.join("\n")], { type: "text/csv" });
  const url = URL.createObjectURL(csvContent);
  const a = document.createElement("a");
  a.setAttribute("hidden", "");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
};

const ExportButtons = ({ data, fileName,csvName }) => {
    const { lightTheme, open } = useContext(AppContext);
  return (
    <div className="flex justify-end gap-2  pr-5">
      <button
        onClick={() => exportToCSV(data, fileName,csvName)}
        className={`w-32 py-2 rounded-full font-semibold transition-all duration-300 transform hover:scale-105 animation ${
          lightTheme
            ? "bg-red-600 text-white hover:bg-red-700"
            : "bg-red-500 text-white hover:bg-red-600"
        } cursor-pointer`}
      >
     {   "Export" +" "+ csvName}
      </button>
    </div>
  );
};

ExportButtons.propTypes = {
  data: PropTypes.array.isRequired,
  fileName: PropTypes.string,
};

export default ExportButtons;
