import { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  TextInput,
  Modal,
  Alert,
} from "react-native";
import { api } from "@/lib/api";
import type { Task } from "@task-app/shared";

export default function TodayScreen() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [adding, setAdding] = useState(false);

  const load = async () => {
    try {
      const data = await api.tasks.list({ today: true });
      setTasks(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const complete = async (task: Task) => {
    const updated = await api.tasks.complete(task.id);
    setTasks((prev) => prev.map((t) => (t.id === task.id ? updated : t)));
  };

  const addTask = async () => {
    if (!newTitle.trim()) return;
    setAdding(true);
    try {
      const task = await api.tasks.create({
        title: newTitle.trim(),
        dueDate: new Date().toISOString(),
      });
      setTasks((prev) => [task, ...prev]);
      setNewTitle("");
      setAddOpen(false);
    } catch (err) {
      Alert.alert("エラー", err instanceof Error ? err.message : "追加に失敗しました");
    } finally {
      setAdding(false);
    }
  };

  const todo = tasks.filter((t) => t.status !== "DONE");
  const done = tasks.filter((t) => t.status === "DONE");

  return (
    <View style={styles.container}>
      <FlatList
        data={[...todo, ...done]}
        keyExtractor={(t) => t.id}
        ListHeaderComponent={() => (
          <View style={styles.header}>
            <Text style={styles.dateText}>
              {new Date().toLocaleDateString("ja-JP", { month: "long", day: "numeric", weekday: "long" })}
            </Text>
          </View>
        )}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.taskItem} onPress={() => complete(item)}>
            <View style={[styles.checkbox, item.status === "DONE" && styles.checkboxDone]}>
              {item.status === "DONE" && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <View style={styles.taskContent}>
              <Text style={[styles.taskTitle, item.status === "DONE" && styles.taskTitleDone]}>
                {item.title}
              </Text>
              {item.project && (
                <Text style={styles.projectLabel}>{item.project.name}</Text>
              )}
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={() =>
          !loading ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>今日のタスクはありません</Text>
            </View>
          ) : null
        }
        contentContainerStyle={styles.listContent}
      />

      {loading && (
        <ActivityIndicator style={styles.loader} color="#db4035" />
      )}

      {/* 追加ボタン */}
      <TouchableOpacity style={styles.fab} onPress={() => setAddOpen(true)}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      {/* 追加モーダル */}
      <Modal visible={addOpen} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>タスクを追加</Text>
            <TextInput
              style={styles.modalInput}
              value={newTitle}
              onChangeText={setNewTitle}
              placeholder="タスク名"
              autoFocus
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => { setAddOpen(false); setNewTitle(""); }}>
                <Text style={styles.cancelText}>キャンセル</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.addButton, adding && styles.buttonDisabled]}
                onPress={addTask}
                disabled={adding}
              >
                <Text style={styles.addButtonText}>{adding ? "追加中..." : "追加"}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  listContent: { paddingBottom: 80 },
  header: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 },
  dateText: { fontSize: 13, color: "#999" },
  taskItem: {
    flexDirection: "row", alignItems: "center",
    paddingHorizontal: 20, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: "#f0f0f0",
  },
  checkbox: {
    width: 20, height: 20, borderRadius: 10,
    borderWidth: 2, borderColor: "#c0c0c0",
    alignItems: "center", justifyContent: "center",
    marginRight: 12,
  },
  checkboxDone: { backgroundColor: "#c0c0c0", borderColor: "#c0c0c0" },
  checkmark: { color: "white", fontSize: 11, fontWeight: "bold" },
  taskContent: { flex: 1 },
  taskTitle: { fontSize: 14, color: "#202020" },
  taskTitleDone: { textDecorationLine: "line-through", color: "#999" },
  projectLabel: { fontSize: 11, color: "#999", marginTop: 2 },
  emptyContainer: { alignItems: "center", paddingTop: 60 },
  emptyText: { color: "#999", fontSize: 14 },
  loader: { position: "absolute", top: "50%", left: "50%" },
  fab: {
    position: "absolute", bottom: 24, right: 24,
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: "#db4035",
    alignItems: "center", justifyContent: "center",
    shadowColor: "#db4035", shadowOpacity: 0.4,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8, elevation: 6,
  },
  fabText: { color: "white", fontSize: 28, lineHeight: 32 },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.3)", justifyContent: "flex-end" },
  modalContent: {
    backgroundColor: "white", borderTopLeftRadius: 20, borderTopRightRadius: 20,
    padding: 20, paddingBottom: 36,
  },
  modalTitle: { fontSize: 16, fontWeight: "600", marginBottom: 12 },
  modalInput: {
    borderWidth: 1, borderColor: "#e5e5e5", borderRadius: 8,
    paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, marginBottom: 16,
  },
  modalButtons: { flexDirection: "row", gap: 12 },
  cancelButton: { flex: 1, paddingVertical: 12, alignItems: "center", borderRadius: 8, backgroundColor: "#f0f0f0" },
  cancelText: { color: "#6b6b6b", fontWeight: "500" },
  addButton: { flex: 1, paddingVertical: 12, alignItems: "center", borderRadius: 8, backgroundColor: "#db4035" },
  buttonDisabled: { opacity: 0.6 },
  addButtonText: { color: "white", fontWeight: "600" },
});
