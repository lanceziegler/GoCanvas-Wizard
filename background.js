chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  if (message.action === "viewPDFs") {
    chrome.tabs.query(
      { title: "Submission Detail | GoCanvas" },
      function (tabs) {
        tabs.forEach(function (tab) {
          chrome.scripting.executeScript({
            target: { tabId: tab.id },
            function: viewFunction,
          });
        });
      }
    );
  } else if (message.action === "downloadPDFs") {
    chrome.tabs.query({ title: "GoCanvas" }, function (tabs) {
      tabs.forEach(function (tab) {
        chrome.scripting.executeScript({
          target: { tabId: tab.id },
          function: downloadFunction,
        });
      });
    });
  } else if (message.action === "compileDampers") {
    chrome.tabs.query(
      { title: "Submission Detail | GoCanvas" },
      function (tabs) {
        tabs.forEach(function (tab) {
          chrome.scripting.executeScript({
            target: { tabId: tab.id },
            function: extractFireDamperValuesForExcel,
          });
        });
      }
    );
  } else if (message.action === "compileFS") {
    chrome.tabs.query(
      { title: "Submission Detail | GoCanvas" },
      function (tabs) {
        tabs.forEach(function (tab) {
          chrome.scripting.executeScript({
            target: { tabId: tab.id },
            function: function () {
              // Inject both getAreaText and compileFSFunction together

              function getAreaText() {
                // Get all dt tags on the page
                const areaDTs = Array.from(
                  document.querySelectorAll("dt")
                ).filter((dt) =>
                  dt
                    .querySelector("span")
                    ?.textContent.includes("Area (Will show on daily)")
                );

                // Initialize an array to store all area values
                const areaValues = [];

                // Loop through all matching dt tags
                areaDTs.forEach((areaDT) => {
                  const ddTag = areaDT.nextElementSibling;
                  if (ddTag) {
                    const spanTag = ddTag.querySelector("span");
                    if (spanTag) {
                      areaValues.push(spanTag.textContent.trim()); // Add the trimmed text to the array
                    }
                  }
                });

                // Return an array of all the area values found
                return areaValues;
              }

              function compileFSFunction() {
                // Function to get the text content from a dt tag's sibling dd tag
                function getTextFromDT(dtTag, searchText) {
                  const dt = Array.from(document.querySelectorAll("dt")).find(
                    (dt) =>
                      dt
                        .querySelector("span")
                        ?.textContent.toLowerCase()
                        .includes(searchText)
                  );
                  if (dt) {
                    return (
                      dt.nextElementSibling
                        .querySelector("div span")
                        ?.textContent.trim() || ""
                    );
                  }
                  return "";
                }

                // Function to check if building is MOB
                function getBuildingType() {
                  const facilityDT = Array.from(
                    document.querySelectorAll("dt")
                  ).find((dt) =>
                    dt
                      .querySelector("span")
                      ?.textContent.includes("Facility Name")
                  );
                  if (facilityDT) {
                    const facilityText =
                      facilityDT.nextElementSibling
                        .querySelector("div span")
                        ?.textContent.toLowerCase() || "";
                    if (
                      facilityText.includes("medical") &&
                      facilityText.includes("office")
                    ) {
                      return "MOB";
                    }
                  }
                  return "Main";
                }

                // Get all area texts sequentially
                const areaValues = getAreaText();

                // Gather data for the table
                const buildingType = getBuildingType();
                const rows = [];

                // Loop through dt tags to gather floor, penetration number, UL listing, comments, installer, and date
                const floorDTs = Array.from(
                  document.querySelectorAll("dt")
                ).filter((dt) =>
                  dt
                    .querySelector("span")
                    ?.textContent.toLowerCase()
                    .includes("floor")
                );
                const penetrationDTs = Array.from(
                  document.querySelectorAll("dt")
                ).filter((dt) =>
                  dt
                    .querySelector("span")
                    ?.textContent.toLowerCase()
                    .includes("photo number")
                );
                const ulListingDTs = Array.from(
                  document.querySelectorAll("dt")
                ).filter((dt) =>
                  dt
                    .querySelector("span")
                    ?.textContent.toLowerCase()
                    .includes("ul system")
                );
                const commentsDTs = Array.from(
                  document.querySelectorAll("dt")
                ).filter((dt) =>
                  dt
                    .querySelector("span")
                    ?.textContent.toLowerCase()
                    .includes("description of repair")
                );

                const installer = getTextFromDT("Crew Members", "crew members");
                const date = getTextFromDT("Date", "date");

                const maxLength = Math.max(
                  floorDTs.length,
                  penetrationDTs.length,
                  ulListingDTs.length,
                  commentsDTs.length
                );

                // Header for the Excel table
                console.log(
                  "Building\tFloor\tPenetrationNumber\tProductName\tULListing\tComments\tInstaller\tDate"
                );

                for (let i = 0; i < maxLength; i++) {
                  const floor =
                    floorDTs[i]?.nextElementSibling
                      .querySelector("div span")
                      ?.textContent.trim() || "";
                  const penetration =
                    penetrationDTs[i]?.nextElementSibling
                      .querySelector("div span")
                      ?.textContent.trim() || "";
                  const ulListing =
                    ulListingDTs[i]?.nextElementSibling
                      .querySelector("div span")
                      ?.textContent.trim() || "";
                  const comments =
                    commentsDTs[i]?.nextElementSibling
                      .querySelector("div span")
                      ?.textContent.trim() || "";

                  // Get the corresponding area text for the current row (if available)
                  const areaText = areaValues[i] || ""; // Use the i-th area value or an empty string if not available
                  const fullComments = `${comments}`; // No "Area: " prefix as requested

                  // Determine ProductName based on UL listing
                  let productName = "";
                  if (ulListing.startsWith("WL")) {
                    productName = "FS-ONE Max Firestop";
                  } else if (ulListing.startsWith("C")) {
                    productName = "CP 618 Putty Stick";
                  }

                  // Push the row formatted as tab-separated values, with new line breaks for Excel
                  rows.push(
                    `${buildingType}\t${floor}\t${penetration}\t${productName}\t${ulListing}\t${areaText} - ${fullComments}\t${installer}\t${date}`
                  );
                }

                // Log each row in the table format, tab-separated
                rows.forEach((row) => {
                  console.log(row);
                });
              }

              // Call the compile function
              compileFSFunction();
            },
          });
        });
      }
    );
  }
});
