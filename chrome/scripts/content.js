// Define the regex pattern for GUIDs
const guidRegex = /\b([a-fA-F0-9]{32})\b/g;

// Will be updated with stored guid mapping, if set in local storage
var guidLookup = {};

function getModifiedContent(originalContent) {
  var modifiedContent = originalContent.replace(guidRegex, function (match) {
    var replacement = guidLookup[match];
    if (replacement) {
      return match + " (" + replacement.fileName + ")";
    } else {
      return match + " (No matching GUID found)";
    }
  });
  return modifiedContent;
}

function addGuidLabels() {
  console.log("Running unity guid replacer");
  var matchCount = 0;
  var nodeCount = 0;

  // Function to process a text node and add labels to GUIDs
  function processTextNode(node) {
    var originalContent = node.nodeValue;
    // Skip nodes that are too short to contain a GUID
    if (!originalContent || originalContent.length < 32) {
      return;
    }

    var modifiedContent = getModifiedContent(originalContent);
    if (originalContent !== modifiedContent) {
      matchCount++;
      node.nodeValue = modifiedContent;
    }
    nodeCount++;
  }

  // Recursive function to traverse all text nodes in an element
  function traverseTextNodes(element) {
    var treeWalker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT, null, false);

    while (treeWalker.nextNode()) {
      processTextNode(treeWalker.currentNode);
    }
  }

  // measure time
  var startTime = performance.now();
  // Traverse all text nodes in the document body
  traverseTextNodes(document.body);
  console.log("Found " + matchCount + " matches" + " in " + nodeCount + " nodes (duration: " + (performance.now() - startTime) + " ms)");
}

addEventListener("load", (event) => {
  chrome.storage.local.get('guidMapping', function (data) {
    if (data) {
      console.log("Found guid mapping from " + JSON.stringify(data.guidMapping.creationDate));
      guidLookup = data.guidMapping.mapping;
    } else {
      console.log('No guid mapping stored');
    }
    // Call adding labels with a small delay to make sure everything is set up
    setTimeout(addGuidLabels, 500);
  });
});
