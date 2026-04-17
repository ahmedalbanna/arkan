# Install
npm install --save-dev dependency-cruiser

# Run with custom rules to highlight domain/infrastructure boundaries
npx depcruise --include-only "^src/modules/users" \
              --output-type dot \
              --do-not-follow "^node_modules" \
              src | dot -T svg > architecture-deps_users.svg

npx depcruise --include-only "^src/modules/ai-content" \
              --output-type json \
              --do-not-follow "^node_modules" \
              src > architecture-deps_ai_content.json
#Run validation (checks rules, fails on error severity)

npx depcruise src

#Generate a visual graph (SVG)
npx depcruise --output-type dot src | dot -T svg > architecture-deps.svg

#Generate an interactive HTML report
npx depcruise --output-type html src > deps-report.html

# Integrate with CI
# Add to your package.json scripts:

"lint:deps": "depcruise src"
