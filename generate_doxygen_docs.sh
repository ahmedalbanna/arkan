#!/bin/bash
#apt-get install graphviz & apt-get install doxygen
# on firebase studio set packages as 
#pkgs.vim # Example existing package
#pkgs.doxygen # Add doxygen here
#pkgs.graphviz # You'll also need graphviz for diagrams
#chmod +x generate_doxygen_docs.sh & ./generate_doxygen_docs.sh
# --- Configuration ---
PROJECT_NAME="My Awesome Project" # Replace with your project name
INPUT_DIR="src"                   # Replace with the main source directory
OUTPUT_DIR="docs/doxygen"         # Directory to save the output
FILE_PATTERNS="*.ts *.tsx *.js *.jsx" # File patterns to include
DOXYFILE="Doxyfile"               # The name of the Doxygen configuration file

# --- Script Logic ---

echo "--- Configuring and Running Doxygen ---"

# 1. Generate Doxyfile if it doesn't exist
if [ ! -f "$DOXYFILE" ]; then
  echo "Generating default $DOXYFILE..."
  doxygen -g "$DOXYFILE"
  if [ $? -ne 0 ]; then
    echo "Error: Failed to generate $DOXYFILE. Is Doxygen installed?"
    exit 1
  fi
fi

# 2. Modify Doxyfile with project-specific settings
echo "Configuring $DOXYFILE..."

# Use sed to modify key parameters.
# This assumes default values or comments are present for these parameters.
# It's safer to use a dedicated tool for more complex Doxyfile modifications,
# but sed is quick for simple key=value changes.

# Function to set a Doxyfile parameter
set_doxy_param() {
  local param="$1"
  local value="$2"
  # Use sed to find the parameter line and replace its value, or add it if not found
  # This sed command tries to replace the value if the parameter exists and is not commented out.
  # It's not perfect for all cases but works for basic modifications.
   sed -i.bak "s/^[[:space:]]*\(#\)\?[[:space:]]*${param}[[:space:]]*=.*/${param} = ${value}/" "$DOXYFILE"
   # If sed -i.bak is not supported (e.g., on some Linux/macOS), use:
   # sed "s/^[[:space:]]*\(#\)\?[[:space:]]*${param}[[:space:]]*=.*/${param} = ${value}/" "$DOXYFILE" > "$DOXYFILE.tmp" && mv "$DOXYFILE.tmp" "$DOXYFILE"

  # If the parameter was commented out or didn't exist, sed might not change anything.
  # A more robust approach would check if the line was modified or search for the parameter afterwards.
  # For this simple script, we assume the sed worked or the parameter's default is acceptable if not set.
}

set_doxy_param "PROJECT_NAME" "\"$PROJECT_NAME\"" # Project name needs quotes if it has spaces
set_doxy_param "INPUT" "$INPUT_DIR"
set_doxy_param "FILE_PATTERNS" "$FILE_PATTERNS"
set_doxy_param "RECURSIVE" "YES"
set_doxy_param "OUTPUT_DIRECTORY" "$OUTPUT_DIR"
set_doxy_param "GENERATE_HTML" "YES"
set_doxy_param "GENERATE_LATEX" "NO" # Usually not needed for basic visualization
set_doxy_param "GENERATE_RTF" "NO"
set_doxy_param "GENERATE_MAN" "NO"
set_doxy_param "GENERATE_XML" "NO"
set_doxy_param "GENERATE_DOTGRAPH" "YES"
set_doxy_param "HAVE_DOT" "YES" # Requires Graphviz
set_doxy_param "DIRECTORY_GRAPH" "YES"
set_doxy_param "INCLUDE_GRAPH" "YES"
set_doxy_param "CLASS_DIAGRAMS" "YES"
set_doxy_param "HIDE_UNDOC_CLASSES" "NO" # Show all classes
set_doxy_param "HIDE_UNDOC_MEMBERS" "NO" # Show all members
set_doxy_param "EXTRACT_ALL" "YES" # Extract all documentation, even without doxygen commands (useful for structure)
set_doxy_param "OPTIMIZE_OUTPUT_FOR_C" "NO" # Disable C optimization
set_doxy_param "OPTIMIZE_OUTPUT_FOR_C" "NO" # Disable C optimization

echo "Configuration complete."

# 3. Create output directory if it doesn't exist
mkdir -p "$OUTPUT_DIR"

# 4. Run Doxygen
echo "Running Doxygen..."
doxygen "$DOXYFILE"

if [ $? -eq 0 ]; then
  echo "Doxygen finished successfully. Output saved to $OUTPUT_DIR/html."
  echo "Open $OUTPUT_DIR/html/index.html in your browser to view the documentation and diagrams."
else
  echo "Error: Doxygen failed to run."
  exit 1
fi

# Optional: Clean up the backup file created by sed
if [ -f "$DOXYFILE.bak" ]; then
  # rm "$DOXYFILE.bak"
   echo "Backup file $DOXYFILE.bak created. You can remove it manually if not needed."
fi

echo "--- Doxygen Script Finished ---"
