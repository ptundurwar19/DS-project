#pragma once
#include <cstdlib>
#include <cstddef>
#include <cstring>

/**
 * Skip List — Probabilistic data structure using multiple linked-list levels.
 * Expected O(log N) for insert, search, delete.
 * Good for concurrent workloads and range queries.
 * Manually implemented for Neuro-DS benchmark engine.
 */
template <typename K>
class SkipList {
private:
    static constexpr int MAX_LEVEL = 16;
    static constexpr double PROBABILITY = 0.5;

    struct Node {
        K key;
        int level;
        Node** forward; // Array of forward pointers

        Node(const K& k, int lvl)
            : key(k), level(lvl) {
            forward = new Node*[lvl + 1];
            std::memset(forward, 0, sizeof(Node*) * (lvl + 1));
        }

        ~Node() {
            delete[] forward;
        }
    };

    Node* header_;
    int currentLevel_;
    size_t size_;
    size_t memory_bytes_;

    int randomLevel() {
        int lvl = 0;
        while (lvl < MAX_LEVEL && ((double)std::rand() / RAND_MAX) < PROBABILITY) {
            lvl++;
        }
        return lvl;
    }

    size_t nodeMemory(int level) const {
        return sizeof(Node) + sizeof(Node*) * (level + 1);
    }

public:
    SkipList() : currentLevel_(0), size_(0), memory_bytes_(0) {
        header_ = new Node(K{}, MAX_LEVEL);
        memory_bytes_ += nodeMemory(MAX_LEVEL);
    }

    ~SkipList() {
        Node* curr = header_->forward[0];
        while (curr) {
            Node* next = curr->forward[0];
            delete curr;
            curr = next;
        }
        delete header_;
    }

    void insert(const K& key) {
        Node* update[MAX_LEVEL + 1];
        std::memset(update, 0, sizeof(Node*) * (MAX_LEVEL + 1));

        Node* curr = header_;
        for (int i = currentLevel_; i >= 0; i--) {
            while (curr->forward[i] && curr->forward[i]->key < key) {
                curr = curr->forward[i];
            }
            update[i] = curr;
        }

        curr = curr->forward[0];

        // Duplicate check
        if (curr && curr->key == key) return;

        int newLevel = randomLevel();

        if (newLevel > currentLevel_) {
            for (int i = currentLevel_ + 1; i <= newLevel; i++) {
                update[i] = header_;
            }
            currentLevel_ = newLevel;
        }

        Node* newNode = new Node(key, newLevel);
        size_++;
        memory_bytes_ += nodeMemory(newLevel);

        for (int i = 0; i <= newLevel; i++) {
            newNode->forward[i] = update[i]->forward[i];
            update[i]->forward[i] = newNode;
        }
    }

    bool search(const K& key) const {
        Node* curr = header_;
        for (int i = currentLevel_; i >= 0; i--) {
            while (curr->forward[i] && curr->forward[i]->key < key) {
                curr = curr->forward[i];
            }
        }
        curr = curr->forward[0];
        return curr && curr->key == key;
    }

    void remove(const K& key) {
        Node* update[MAX_LEVEL + 1];
        std::memset(update, 0, sizeof(Node*) * (MAX_LEVEL + 1));

        Node* curr = header_;
        for (int i = currentLevel_; i >= 0; i--) {
            while (curr->forward[i] && curr->forward[i]->key < key) {
                curr = curr->forward[i];
            }
            update[i] = curr;
        }

        curr = curr->forward[0];

        if (!curr || curr->key != key) return;

        for (int i = 0; i <= currentLevel_; i++) {
            if (update[i]->forward[i] != curr) break;
            update[i]->forward[i] = curr->forward[i];
        }

        memory_bytes_ -= nodeMemory(curr->level);
        delete curr;
        size_--;

        while (currentLevel_ > 0 && !header_->forward[currentLevel_]) {
            currentLevel_--;
        }
    }

    size_t size() const { return size_; }
    size_t memoryBytes() const { return memory_bytes_; }
};
