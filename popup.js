document.addEventListener("DOMContentLoaded", function () {
  document.getElementById("viewButton").addEventListener("click", function () {
    chrome.runtime.sendMessage({ action: "viewPDFs" });
  });
  document
    .getElementById("downloadButton")
    .addEventListener("click", function () {
      chrome.runtime.sendMessage({ action: "downloadPDFs" });
    });
  document
    .getElementById("compileDampersButton")
    .addEventListener("click", function () {
      chrome.runtime.sendMessage({ action: "compileDampers" });
    });
});
