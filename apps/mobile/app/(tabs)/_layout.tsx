import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#db4035",
        tabBarInactiveTintColor: "#999",
        tabBarStyle: { borderTopColor: "#e5e5e5" },
        headerStyle: { backgroundColor: "#1f1f1f" },
        headerTintColor: "#fff",
        headerTitleStyle: { fontWeight: "600" },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "今日",
          tabBarIcon: ({ color }) => <Ionicons name="calendar-outline" size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="inbox"
        options={{
          title: "インボックス",
          tabBarIcon: ({ color }) => <Ionicons name="file-tray-outline" size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="projects"
        options={{
          title: "プロジェクト",
          tabBarIcon: ({ color }) => <Ionicons name="folder-outline" size={22} color={color} />,
        }}
      />
    </Tabs>
  );
}
