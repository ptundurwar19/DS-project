#pragma once
#include <cstddef>

/**
 * Red-Black Tree — Self-balancing BST with color properties.
 * Guarantees O(log N) for insert, search, delete.
 * Slightly faster inserts than AVL due to fewer rotations.
 * Manually implemented for Neuro-DS benchmark engine.
 */
template <typename K>
class RedBlackTree {
private:
    enum Color { RED, BLACK };

    struct Node {
        K key;
        Color color;
        Node* left;
        Node* right;
        Node* parent;

        Node(const K& k, Color c, Node* p)
            : key(k), color(c), left(nullptr), right(nullptr), parent(p) {}
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

    // --- Insert fix-up (restore RB properties) ---
    void insertFixup(Node* z) {
        while (z->parent && z->parent->color == RED) {
            if (z->parent == z->parent->parent->left) {
                Node* uncle = z->parent->parent->right;
                if (uncle && uncle->color == RED) {
                    // Case 1: Uncle is red — recolor
                    z->parent->color = BLACK;
                    uncle->color = BLACK;
                    z->parent->parent->color = RED;
                    z = z->parent->parent;
                } else {
                    if (z == z->parent->right) {
                        // Case 2: z is right child — rotate left
                        z = z->parent;
                        rotateLeft(z);
                    }
                    // Case 3: z is left child — rotate right
                    z->parent->color = BLACK;
                    z->parent->parent->color = RED;
                    rotateRight(z->parent->parent);
                }
            } else {
                // Mirror cases
                Node* uncle = z->parent->parent->left;
                if (uncle && uncle->color == RED) {
                    z->parent->color = BLACK;
                    uncle->color = BLACK;
                    z->parent->parent->color = RED;
                    z = z->parent->parent;
                } else {
                    if (z == z->parent->left) {
                        z = z->parent;
                        rotateRight(z);
                    }
                    z->parent->color = BLACK;
                    z->parent->parent->color = RED;
                    rotateLeft(z->parent->parent);
                }
            }
        }
        root_->color = BLACK;
    }

    // --- Transplant (replace subtree) ---
    void transplant(Node* u, Node* v) {
        if (!u->parent) root_ = v;
        else if (u == u->parent->left) u->parent->left = v;
        else u->parent->right = v;
        if (v) v->parent = u->parent;
    }

    Node* minimum(Node* n) const {
        while (n->left) n = n->left;
        return n;
    }

    Color nodeColor(Node* n) const {
        return (!n) ? BLACK : n->color;
    }

    // --- Delete fix-up ---
    void deleteFixup(Node* x, Node* xParent) {
        while (x != root_ && nodeColor(x) == BLACK) {
            if (x == (xParent ? xParent->left : nullptr)) {
                Node* w = xParent->right;
                if (nodeColor(w) == RED) {
                    w->color = BLACK;
                    xParent->color = RED;
                    rotateLeft(xParent);
                    w = xParent->right;
                }
                if (nodeColor(w ? w->left : nullptr) == BLACK &&
                    nodeColor(w ? w->right : nullptr) == BLACK) {
                    if (w) w->color = RED;
                    x = xParent;
                    xParent = x->parent;
                } else {
                    if (nodeColor(w ? w->right : nullptr) == BLACK) {
                        if (w && w->left) w->left->color = BLACK;
                        if (w) w->color = RED;
                        if (w) rotateRight(w);
                        w = xParent->right;
                    }
                    if (w) w->color = xParent->color;
                    xParent->color = BLACK;
                    if (w && w->right) w->right->color = BLACK;
                    rotateLeft(xParent);
                    x = root_;
                }
            } else {
                // Mirror
                Node* w = xParent->left;
                if (nodeColor(w) == RED) {
                    w->color = BLACK;
                    xParent->color = RED;
                    rotateRight(xParent);
                    w = xParent->left;
                }
                if (nodeColor(w ? w->right : nullptr) == BLACK &&
                    nodeColor(w ? w->left : nullptr) == BLACK) {
                    if (w) w->color = RED;
                    x = xParent;
                    xParent = x->parent;
                } else {
                    if (nodeColor(w ? w->left : nullptr) == BLACK) {
                        if (w && w->right) w->right->color = BLACK;
                        if (w) w->color = RED;
                        if (w) rotateLeft(w);
                        w = xParent->left;
                    }
                    if (w) w->color = xParent->color;
                    xParent->color = BLACK;
                    if (w && w->left) w->left->color = BLACK;
                    rotateRight(xParent);
                    x = root_;
                }
            }
        }
        if (x) x->color = BLACK;
    }

    void destroy(Node* n) {
        if (!n) return;
        destroy(n->left);
        destroy(n->right);
        delete n;
    }

public:
    RedBlackTree() : root_(nullptr), size_(0), memory_bytes_(0) {}

    ~RedBlackTree() {
        destroy(root_);
    }

    void insert(const K& key) {
        Node* parent = nullptr;
        Node* curr = root_;

        while (curr) {
            parent = curr;
            if (key < curr->key) curr = curr->left;
            else if (key > curr->key) curr = curr->right;
            else return; // Duplicate
        }

        Node* z = new Node(key, RED, parent);
        size_++;
        memory_bytes_ += sizeof(Node);

        if (!parent) {
            root_ = z;
        } else if (key < parent->key) {
            parent->left = z;
        } else {
            parent->right = z;
        }

        insertFixup(z);
    }

    bool search(const K& key) const {
        Node* curr = root_;
        while (curr) {
            if (key < curr->key) curr = curr->left;
            else if (key > curr->key) curr = curr->right;
            else return true;
        }
        return false;
    }

    void remove(const K& key) {
        Node* z = root_;
        while (z) {
            if (key < z->key) z = z->left;
            else if (key > z->key) z = z->right;
            else break;
        }
        if (!z) return;

        Node* y = z;
        Color yOrigColor = y->color;
        Node* x = nullptr;
        Node* xParent = nullptr;

        if (!z->left) {
            x = z->right;
            xParent = z->parent;
            transplant(z, z->right);
        } else if (!z->right) {
            x = z->left;
            xParent = z->parent;
            transplant(z, z->left);
        } else {
            y = minimum(z->right);
            yOrigColor = y->color;
            x = y->right;
            if (y->parent == z) {
                xParent = y;
            } else {
                xParent = y->parent;
                transplant(y, y->right);
                y->right = z->right;
                y->right->parent = y;
            }
            transplant(z, y);
            y->left = z->left;
            y->left->parent = y;
            y->color = z->color;
        }

        delete z;
        size_--;
        memory_bytes_ -= sizeof(Node);

        if (yOrigColor == BLACK) {
            deleteFixup(x, xParent);
        }
    }

    size_t size() const { return size_; }
    size_t memoryBytes() const { return memory_bytes_; }
};
