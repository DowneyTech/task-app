import { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { router } from "expo-router";
import { api } from "@/lib/api";
import type { Project } from "@task-app/shared";

export default function ProjectsScreen() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.projects.list()
      .then(setProjects)
      .finally(() => setLoading(false));
  }, []);

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator style={styles.loader} color="#db4035" />
      ) : (
        <FlatList
          data={projects}
          keyExtractor={(p) => p.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.item}
              onPress={() => router.push(`/(tabs)/project?id=${item.id}`)}
            >
              <View style={[styles.dot, { backgroundColor: item.color }]} />
              <Text style={styles.name}>{item.name}</Text>
              {item.taskCount != null && item.taskCount > 0 && (
                <Text style={styles.count}>{item.taskCount}</Text>
              )}
            </TouchableOpacity>
          )}
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>プロジェクトがありません</Text>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  loader: { flex: 1 },
  item: {
    flexDirection: "row", alignItems: "center",
    paddingHorizontal: 20, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: "#f0f0f0",
  },
  dot: { width: 10, height: 10, borderRadius: 5, marginRight: 12 },
  name: { flex: 1, fontSize: 15, color: "#202020" },
  count: { fontSize: 13, color: "#999" },
  emptyContainer: { alignItems: "center", paddingTop: 60 },
  emptyText: { color: "#999", fontSize: 14 },
});
