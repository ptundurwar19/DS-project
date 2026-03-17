#pragma once
#include <cstddef>

/**
 * Splay Tree — Self-adjusting BST that moves accessed nodes to root.
 * Excellent for workloads with temporal locality (recently accessed = accessed again).
 * Amortized O(log N) for all operations.
 * Manually implemented for Neuro-DS benchmark engine.
 */
template <typename K>
class SplayTree {
private:
    struct Node {
        K key;
        Node* left;
        Node* right;
        Node* parent;

        Node(const K& k, Node* p = nullptr)
            : key(k), left(nullptr), right(nullptr), parent(p) {}
    };

    Node* root_;
    size_t size_;
    size_t memory_bytes_;

    // --- Rotation helpers ---
    void rotateLeft(Node* x) {
        Node* y = x->right;
        x->right = y->left;
        if (y->left) y->left->parent = x;
        y->parent = x->parent;
        if (!x->parent) root_ = y;
        else if (x == x->parent->left) x->parent->left = y;
        else x->parent->right = y;
        y->left = x;
        x->parent = y;
    }

    void rotateRight(Node* x) {
        Node* y = x->left;
        x->left = y->right;
        if (y->right) y->right->parent = x;
        y->parent = x->parent;
        if (!x->parent) root_ = y;
        else if (x == x->parent->right) x->parent->right = y;
        else x->parent->left = y;
        y->right = x;
        x->parent = y;
    }

    // --- The Splay operation: move node to root ---
    void splay(Node* x) {
        while (x->parent) {
            if (!x->parent->parent) {
                // Zig step (x is child of root)
                if (x == x->parent->left) rotateRight(x->parent);
                else rotateLeft(x->parent);
            } else if (x == x->parent->left && x->parent == x->parent->parent->left) {
                // Zig-Zig (both left children)
                rotateRight(x->parent->parent);
                rotateRight(x->parent);
            } else if (x == x->parent->right && x->parent == x->parent->parent->right) {
                // Zig-Zig (both right children)
                rotateLeft(x->parent->parent);
                rotateLeft(x->parent);
            } else if (x == x->parent->right && x->parent == x->parent->parent->left) {
                // Zig-Zag (left then right)
                rotateLeft(x->parent);
                rotateRight(x->parent);
            } else {
                // Zig-Zag (right then left)
                rotateRight(x->parent);
                rotateLeft(x->parent);
            }
        }
    }

    Node* findNode(const K& key) {
        Node* curr = root_;
        Node* last = nullptr;
        while (curr) {
            last = curr;
            if (key < curr->key) curr = curr->left;
            else if (key > curr->key) curr = curr->right;
            else {
                splay(curr);
                return curr;
            }
        }
        if (last) splay(last);
        return nullptr;
    }

    // --- Subtree maximum ---
    Node* subtreeMax(Node* n) {
        while (n->right) n = n->right;
        return n;
    }

    void destroy(Node* n) {
        if (!n) return;
        destroy(n->left);
        destroy(n->right);
        delete n;
    }

public:
    SplayTree() : root_(nullptr), size_(0), memory_bytes_(0) {}

    ~SplayTree() {
        destroy(root_);
    }

    void insert(const K& key) {
        if (!root_) {
            root_ = new Node(key);
            size_++;
            memory_bytes_ += sizeof(Node);
            return;
        }

        Node* curr = root_;
        Node* parent = nullptr;
        while (curr) {
            parent = curr;
            if (key < curr->key) curr = curr->left;
            else if (key > curr->key) curr = curr->right;
            else {
                splay(curr); // Duplicate — splay existing node to root
                return;
            }
        }

        Node* newNode = new Node(key, parent);
        size_++;
        memory_bytes_ += sizeof(Node);

        if (key < parent->key) parent->left = newNode;
        else parent->right = newNode;

        splay(newNode);
    }

    bool search(const K& key) {
        if (!root_) return false;
        Node* found = findNode(key);
        return found != nullptr;
    }

    void remove(const K& key) {
        Node* found = findNode(key);
        if (!found) return;

        // found is now root after splay
        if (!root_->left) {
            Node* old = root_;
            root_ = root_->right;
            if (root_) root_->parent = nullptr;
            delete old;
        } else {
            Node* rightSubtree = root_->right;
            Node* old = root_;
            root_ = root_->left;
            root_->parent = nullptr;

            // Splay the max of left subtree to root
            Node* maxLeft = subtreeMax(root_);
            splay(maxLeft);

            // Attach right subtree
            root_->right = rightSubtree;
            if (rightSubtree) rightSubtree->parent = root_;
            delete old;
        }

        size_--;
        memory_bytes_ -= sizeof(Node);
    }

    size_t size() const { return size_; }
    size_t memoryBytes() const { return memory_bytes_; }
};
