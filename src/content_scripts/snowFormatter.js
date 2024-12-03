(() => {
  // Immediate function to encapsulate code and avoid global scope pollution
  // Flag to enable or disable logging
  const logging = false,
    // Detect if the user is on a Mac system
    isMacUser = navigator.userAgent.indexOf("Mac") != -1,
    // Logging function that logs only if logging is enabled
    log = (str) => {
      if (logging) console.log(str);
    },
    // Function to apply formatting commands to the selected text
    editHighlighted = function (command, selection) {
      log("in command");
      // Define the replacement codes for each command
      const replacements = {
        // Hyperlink command, special handling for cursor positioning
        hyperlink: (() => {
          const startCode = '[code]<a href="" target="_blank">';
          return {
            startCode: startCode,
            endCode: "</a>[/code]",
            selectionEnd: startCode.indexOf('"') + 1,
          };
        })(),
        // Bold formatting
        bold: {
          startCode: "[code]<b>",
          endCode: "</b>[/code]",
        },
        // Italic formatting
        italic: {
          startCode: "[code]<i>",
          endCode: "</i>[/code]",
        },
        // Image insertion
        image: {
          startCode: `[code]<img src="`,
          endCode: `" width=600px />[/code]`,
        },
        // Ordered list formatting
        orderedList: {
          startCode: "[code]\n<ol>\n<li>\n",
          endCode: "\n</li>\n</ol>\n[/code]",
        },
        // Unordered list formatting
        unorderedList: {
          startCode: "[code]\n<ul>\n<li>\n",
          endCode: "\n</li>\n</ul>\n[/code]",
        },
        // Inline code formatting
        code: {
          startCode:
            "[code]<code style='display: inline-block; border: 0.5px solid #BBBBBB; border-radius: 1px; background-color: #E5E5E5; padding: 5px; margin-left: 3px; margin-right: 2px;'>",
          endCode: "</code>[/code]",
        },
        // Blockquote formatting
        blockquote: {
          startCode:
            "[code]<blockquote style='border-left: 3px solid #00629B; padding: 1em;'>\n[/code]",
          endCode: "[code]\n</blockquote>[/code]",
        },
        // List item formatting
        listItem: {
          startCode: "<li>\n",
          endCode: "\n</li>",
        },
        // Paragraph formatting
        paragraph: {
          startCode: "[code]<p>\n",
          endCode: "\n</p>[/code]",
        },
      };

      // Get the textarea or input element from the selection
      const textArea = selection.focusNode.querySelector("textarea,input"),
        // Get the selection start and end positions
        start = textArea.selectionStart,
        end = textArea.selectionEnd,
        // Check if the last character is a space
        lastChar = textArea.value.substring(end - 1, end) === " ",
        // Preserve the trailing space if any
        optionalSpace = lastChar ? " " : "";

      // Initialize variables for the replacement codes
      let startCode,
        endCode,
        selectionEnd = -1;

      // Return if the command is not recognized
      if (!Object.keys(replacements).includes(command)) {
        return;
      }

      // Get the replacement codes for the command
      const replacement = replacements[command];
      startCode = replacement.startCode;
      endCode = replacement.endCode;

      // Determine the new cursor position after insertion
      if (Object.keys(replacement).includes("selectionEnd")) {
        // For commands like hyperlink, set cursor inside the href attribute
        selectionEnd = start + replacement.selectionEnd;
      } else {
        // Set cursor after the inserted text
        selectionEnd =
          end - start > 0
            ? end + startCode.length + endCode.length
            : start + startCode.length;
      }

      // Construct the new text to insert, wrapping the selected text
      const insertedText =
        startCode +
        textArea.value.substring(start, end).trim() +
        endCode +
        optionalSpace;

      // Replace the selected text with the formatted text
      textArea.setRangeText(insertedText, start, end, "end");

      // Briefly blur and refocus the textarea to update the selection
      setTimeout(() => {
        textArea.blur();
        textArea.focus();
      }, 10);

      // Set the cursor to the new position
      textArea.selectionEnd = selectionEnd;
    },
    // Function to handle keydown events for shortcuts
    keyDown = (e) => {
      const selection = document.getSelection();

      log(selection);

      // Ignore if selection spans multiple nodes or is not within a textarea/input
      if (
        selection.focusNode !== selection.anchorNode ||
        selection.focusNode === undefined ||
        selection.focusNode === null ||
        selection.focusNode.nodeType === 3 ||
        !selection.focusNode.querySelector("textarea,input")
      )
        return;

      // Check if the correct modifier key is pressed (Cmd on Mac, Ctrl on others)
      if ((isMacUser && e.metaKey) || (!isMacUser && e.ctrlKey)) {
        const shiftDown = e.shiftKey,
          letter = e.key.toLowerCase();

        // Loop through key combinations to find a match
        for (let command in keyCombinations) {
          const combo = keyCombinations[command],
            comboMatches = combo[0] == shiftDown && combo[1] == letter;

          if (comboMatches) {
            // Prevent default browser action and apply formatting
            e.preventDefault();
            editHighlighted(command, selection);
            return;
          }
        }
      }
    };

  // Define key combinations for formatting commands [shiftKey, key]
  //[shift, letter]
  let keyCombinations = {
    hyperlink: [false, isMacUser ? "k" : "q"],
    bold: [false, "b"],
    italic: [false, "i"],
    image: [true, "i"],
    orderedList: [false, "o"],
    unorderedList: [false, "u"],
    code: [true, "c"],
    blockquote: [true, "b"],
    listItem: [true, "l"],
    paragraph: [false, "p"],
  };

  // Add the keydown event listener after a delay
  setTimeout(() => window.addEventListener("keydown", keyDown), 1000);
})();
