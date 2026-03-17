#pragma once
#include <functional>
#include <cstddef>

/**
 * AVL Tree — Self-balancing BST with strict height balancing.
 * Guarantees O(log N) for insert, search, delete.
 * Manually implemented for Neuro-DS benchmark engine.
 */
template <typename K>
class AVLTree {
private:
    struct Node {
        K key;
        Node* left;
        Node* right;
        int height;

        Node(const K& k) : key(k), left(nullptr), right(nullptr), height(1) {}
    };

    Node* root_;
    size_t size_;
    size_t memory_bytes_;

    int height(Node* n) const {
        return n ? n->height : 0;
    }

    int balanceFactor(Node* n) const {
        return n ? height(n->left) - height(n->right) : 0;
    }

    void updateHeight(Node* n) {
        if (n) {
            n->height = 1 + std::max(height(n->left), height(n->right));
        }
    }

    Node* rotateRight(Node* y) {
        Node* x = y->left;
        Node* T2 = x->right;
        x->right = y;
        y->left = T2;
        updateHeight(y);
        updateHeight(x);
        return x;
    }

    Node* rotateLeft(Node* x) {
        Node* y = x->right;
        Node* T2 = y->left;
        y->left = x;
        x->right = T2;
        updateHeight(x);
        updateHeight(y);
        return y;
    }

    Node* balance(Node* n) {
        updateHeight(n);
        int bf = balanceFactor(n);

        // Left Heavy
        if (bf > 1) {
            if (balanceFactor(n->left) < 0) {
                n->left = rotateLeft(n->left); // Left-Right case
            }
            return rotateRight(n); // Left-Left case
        }

        // Right Heavy
        if (bf < -1) {
            if (balanceFactor(n->right) > 0) {
                n->right = rotateRight(n->right); // Right-Left case
            }
            return rotateLeft(n); // Right-Right case
        }

        return n;
    }

    Node* insert(Node* n, const K& key) {
        if (!n) {
            size_++;
            memory_bytes_ += sizeof(Node);
            return new Node(key);
        }

        if (key < n->key) {
            n->left = insert(n->left, key);
        } else if (key > n->key) {
            n->right = insert(n->right, key);
        } else {
            return n; // Duplicate — no insert
        }

        return balance(n);
    }

    Node* findMin(Node* n) const {
        while (n->left) n = n->left;
        return n;
    }

    Node* removeMin(Node* n) {
        if (!n->left) return n->right;
        n->left = removeMin(n->left);
        return balance(n);
    }

    Node* remove(Node* n, const K& key) {
        if (!n) return nullptr;

        if (key < n->key) {
            n->left = remove(n->left, key);
        } else if (key > n->key) {
            n->right = remove(n->right, key);
        } else {
            Node* l = n->left;
            Node* r = n->right;
            delete n;
            size_--;
            memory_bytes_ -= sizeof(Node);

            if (!r) return l;

            Node* minRight = findMin(r);
            minRight->right = removeMin(r);
            minRight->left = l;
            return balance(minRight);
        }

        return balance(n);
    }

    bool search(Node* n, const K& key) const {
        if (!n) return false;
        if (key < n->key) return search(n->left, key);
        if (key > n->key) return search(n->right, key);
        return true;
    }

    void destroy(Node* n) {
        if (!n) return;
        destroy(n->left);
        destroy(n->right);
        delete n;
    }

public:
    AVLTree() : root_(nullptr), size_(0), memory_bytes_(0) {}

    ~AVLTree() {
        destroy(root_);
    }

    void insert(const K& key) {
        root_ = insert(root_, key);
    }

    bool search(const K& key) const {
        return search(root_, key);
    }

    void remove(const K& key) {
        root_ = remove(root_, key);
    }

    size_t size() const { return size_; }
    size_t memoryBytes() const { return memory_bytes_; }
};
