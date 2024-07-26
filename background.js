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
