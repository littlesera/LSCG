/**
 * A class representing a directed graph. The graph consists of string nodes, and edges defined by string to/from
 * 2-tuples
 */
declare class DirectedGraph {
    /**
     * @param {string[]} vertices
     * @param {[string, string][]} edges
     */
    constructor(vertices: string[], edges: [string, string][]);
    vertices: string[];
    size: number;
    edges: [string, string][];
    adjacencyList: Record<string, string[]>;
    /**
     * Constructs and sets the adjacency list for this graph based on its edge definitions
     * @returns {Record<string, string[]>} - The adjacency list for the graph
     */
    buildAdjacencyList(): Record<string, string[]>;
    /**
     * Creates a new subgraph of this graph by removing a given vertex, along with all edges attached to that vertex
     * @param {string} vertex - The vertex to remove
     * @returns {DirectedGraph} - The subgraph of this graph obtained by removing the given vertex and all attached
     * edges
     */
    removeVertex(vertex: string): DirectedGraph;
    /**
     * Creates a new subgraph of this graph by keeping only the given vertices and any edges between them
     * @param {string[]} vertices - The vertices to keep
     * @returns {DirectedGraph} - The subgraph of this graph obtained by only keeping the given vertices and any edges
     * between them
     */
    subgraphFromVertices(vertices: string[]): DirectedGraph;
    /**
     * Calculates the strongly connected components of the graph using Tarjan's strongly connected components algorithm.
     * See https://en.wikipedia.org/wiki/Tarjan%27s_strongly_connected_components_algorithm
     * @returns {string[][]} - An array containing the strongly connected components of this graph, each represented as
     * an array of vertex numbers
     */
    getStronglyConnectedComponents(): string[][];
    /**
     * Finds all simple cycles in this graph using Johnson's algorithm (see https://epubs.siam.org/doi/10.1137/0204007)
     * @returns {string[][]}
     */
    findCycles(): string[][];
}
