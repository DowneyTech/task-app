import { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { api } from "@/lib/api";
import type { Task } from "@task-app/shared";

export default function InboxScreen() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const data = await api.tasks.list();
      setTasks(data.filter((t) => !t.projectId));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const complete = async (task: Task) => {
    const updated = await api.tasks.complete(task.id);
    setTasks((prev) => prev.map((t) => (t.id === task.id ? updated : t)));
  };

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator color="#db4035" />
      ) : (
        <FlatList
          data={tasks}
          keyExtractor={(t) => t.id}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.item} onPress={() => complete(item)}>
              <View style={[styles.cb, item.status === "DONE" && styles.cbDone]}>
                {item.status === "DONE" && <Text style={styles.check}>✓</Text>}
              </View>
              <Text style={[styles.title, item.status === "DONE" && styles.titleDone]}>
                {item.title}
              </Text>
            </TouchableOpacity>
          )}
          ListEmptyComponent={() => (
            <View style={styles.empty}>
              <Text style={styles.emptyText}>インボックスは空です</Text>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  item: {
    flexDirection: "row", alignItems: "center",
    paddingHorizontal: 20, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: "#f0f0f0",
  },
  cb: {
    width: 20, height: 20, borderRadius: 10,
    borderWidth: 2, borderColor: "#c0c0c0",
    alignItems: "center", justifyContent: "center",
    marginRight: 12,
  },
  cbDone: { backgroundColor: "#c0c0c0", borderColor: "#c0c0c0" },
  check: { color: "white", fontSize: 11, fontWeight: "bold" },
  title: { fontSize: 14, color: "#202020", flex: 1 },
  titleDone: { textDecorationLine: "line-through", color: "#999" },
  empty: { alignItems: "center", paddingTop: 60 },
  emptyText: { color: "#999", fontSize: 14 },
});
