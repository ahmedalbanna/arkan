ts_dependency_graph --start src/app/page.tsx --graph_folder --filter --max_depth 1  |tsx --graph_folder --filter --max_depth 1  | dot -T svg > dependencygraph.svg
