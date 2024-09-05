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
            function: compileFSFunction,
          });
        });
      }
    );
  }

  // else if (message.action === "compileHiltiLabels") {
  //   chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
  //     if (tabs.length > 0) {
  //       chrome.scripting.executeScript({
  //         target: { tabId: tabs[0].id },
  //         function: compileHiltiLabelsFunction,
  //       });
  //     }
  //   });
  // }
});

function viewFunction() {
  // Find all <a> tags
  const links = document.querySelectorAll("a");

  // Loop through each <a> tag
  for (const link of links) {
    // Find the child <span> element
    const span = link.querySelector("span");
    // If the span contains "View PDF" text, click the link
    if (span && span.textContent.trim() === "View PDF") {
      link.click();
      return; // Stop searching after clicking the first link
    }
  }

  console.log("View PDF link not found");
}

function downloadFunction() {
  // Find all <a> tags
  const links = document.querySelectorAll("a");

  // Loop through each <a> tag
  for (const link of links) {
    // Find the child <span> element
    const span = link.querySelector("span");
    // If the span contains "Download PDF" text, click the link
    if (span && span.textContent.trim() === "Download PDF") {
      link.click();
      return; // Stop searching after clicking the first link
    }
  }

  console.log("Download PDF link not found");
}

//! DAMPERS FUNCTION --------- DAMPERS FUNCTION --------- DAMPERS FUNCTION ---------
function extractFireDamperValuesForExcel() {
  // Select all <dl> tags on the current webpage
  const dlTags = document.querySelectorAll("dl");

  // Initialize an array to store the values
  const values = [];
  let totalDampersSurveyed = "";
  let tds = "";

  // Loop through each <dl> tag
  dlTags.forEach((dlTag) => {
    // Check if the <dl> tag has a <dt> tag with text content containing "Fire Damper #"
    const dtTags = dlTag.querySelectorAll("dt");
    dtTags.forEach((dtTag) => {
      if (dtTag.textContent.includes("Fire Damper #")) {
        // If found, get the text content of the <dd>'s first child <span>
        const ddTag = dtTag.nextElementSibling;
        const spanTag = ddTag.querySelector("span");
        if (spanTag) {
          values.push(spanTag.textContent.trim());
        }
      }
    });

    // Check if the <dl> tag has a <dt> tag with a <span> containing "Total Dampers Surveyed"
    const dtSpan = dlTag.querySelector("dt span");
    if (dtSpan && dtSpan.textContent.trim() === "Total Dampers Surveyed") {
      // If found, get the text content of the <dd>'s first child <span>
      const ddTag = dlTag.querySelector("dd");
      tds = dtSpan && dtSpan.textContent.trim();
      const spanTag = ddTag.querySelector("span");
      if (spanTag) {
        totalDampersSurveyed = spanTag.textContent.trim();
      }
    }
  });

  // Generate a string in a format suitable for Excel
  const excelString = values.join("\n");

  // Log the string to the console
  console.log(excelString);
  console.log(`Total: ${values.length}`);
  console.log(`${tds}: ${totalDampersSurveyed}`);
}

//! FIRESTOPPING FUNCTION --------- FIRESTOPPING FUNCTION --------- FIRESTOPPING FUNCTION ---------
function compileFSFunction() {
  // Function to get the text content from a dt tag's sibling dd tag
  function getTextFromDT(dtTag, searchText) {
    const dt = Array.from(document.querySelectorAll("dt")).find((dt) =>
      dt.querySelector("span")?.textContent.toLowerCase().includes(searchText)
    );
    if (dt) {
      return (
        dt.nextElementSibling.querySelector("div span")?.textContent.trim() ||
        ""
      );
    }
    return "";
  }

  // Function to check if building is MOB
  function getBuildingType() {
    const facilityDT = Array.from(document.querySelectorAll("dt")).find((dt) =>
      dt.querySelector("span")?.textContent.includes("Facility Name")
    );
    if (facilityDT) {
      const facilityText =
        facilityDT.nextElementSibling
          .querySelector("div span")
          ?.textContent.toLowerCase() || "";
      if (facilityText.includes("medical") && facilityText.includes("office")) {
        return "MOB";
      }
    }
    return "Main";
  }

  // Function to get the area text from the corresponding dt and its sibling dd
  function getAreaText() {
    // Find the dt with the exact text "Area (Will show on daily)"
    const areaDT = Array.from(document.querySelectorAll("dt")).find((dt) =>
      dt
        .querySelector("span")
        ?.textContent.includes("Area (Will show on daily)")
    );
    if (areaDT) {
      const ddTag = areaDT.nextElementSibling;
      if (ddTag) {
        const spanTag = ddTag.querySelector("span");
        if (spanTag) {
          return spanTag.textContent.trim();
        }
      }
    }
    return "";
  }

  // Gather data for the table
  const buildingType = getBuildingType();
  const rows = [];

  // Loop through dt tags to gather floor, penetration number, UL listing, comments, installer, and date
  const floorDTs = Array.from(document.querySelectorAll("dt")).filter((dt) =>
    dt.querySelector("span")?.textContent.toLowerCase().includes("floor")
  );
  const penetrationDTs = Array.from(document.querySelectorAll("dt")).filter(
    (dt) =>
      dt
        .querySelector("span")
        ?.textContent.toLowerCase()
        .includes("photo number")
  );
  const ulListingDTs = Array.from(document.querySelectorAll("dt")).filter(
    (dt) =>
      dt.querySelector("span")?.textContent.toLowerCase().includes("ul system")
  );
  const commentsDTs = Array.from(document.querySelectorAll("dt")).filter((dt) =>
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

    // Get the "Area (Will show on daily)" and concatenate it with the comment
    const areaText = getAreaText();
    const fullComments = `Area: ${areaText} - ${comments}`;

    // Determine ProductName based on UL listing
    let productName = "";
    if (ulListing.startsWith("WL")) {
      productName = "FS-ONE Max Firestop";
    } else if (ulListing.startsWith("C")) {
      productName = "CP 618 Putty Stick";
    }

    // Push the row formatted as tab-separated values, with new line breaks for Excel
    rows.push(
      `${buildingType}\t${floor}\t${penetration}\t${productName}\t${ulListing}\t${fullComments}\t${installer}\t${date}`
    );
  }

  // Log each row in the table format, tab-separated
  rows.forEach((row) => {
    console.log(row);
  });
}

function compileHiltiLabelsFunction() {
  let markingsList = CategoryMarkingsArray.getMarkingsList();
  let sortedItemLabels = markingsList
    .map((marking) => marking.itemLabel)
    .sort((a, b) => parseInt(a, 10) - parseInt(b, 10));
  let formattedItemLabels = sortedItemLabels.join("\n");
  console.log(formattedItemLabels);
}

// function compileHiltiLabelsFunction() {
//   function waitForCategoryMarkingsArray() {
//     return new Promise((resolve) => {
//       const checkInterval = setInterval(() => {
//         if (
//           typeof CategoryMarkingsArray !== "undefined" &&
//           typeof CategoryMarkingsArray.getMarkingsList === "function"
//         ) {
//           clearInterval(checkInterval);
//           resolve();
//         }
//       }, 100);
//     });
//   }

//   async function run() {
//     await waitForCategoryMarkingsArray();

//     try {
//       const script = `
//         let markingsList = CategoryMarkingsArray.getMarkingsList();

//         // Step 2: Extract and sort the itemLabels as strings
//         let sortedItemLabels = markingsList
//           .map((marking) => marking.itemLabel) // Extract itemLabels as strings
//           .sort((a, b) => parseInt(a, 10) - parseInt(b, 10)); // Sort numerically

//         // Step 3: Format the itemLabels for easy copying and pasting
//         let formattedItemLabels = sortedItemLabels.join("\\n");

//         // Step 4: Log the formatted itemLabels
//         console.log(formattedItemLabels);
//       `;
//       eval(script);
//     } catch (error) {
//       console.error("An error occurred while executing the script:", error);
//     }
//   }

//   run();
// }
