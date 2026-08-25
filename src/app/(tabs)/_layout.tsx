import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";

type IoniconName = React.ComponentProps<typeof Ionicons>["name"];

function TabIcon({ name, color }: { name: IoniconName; color: string }) {
  return <Ionicons name={name} size={24} color={color} />;
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#1E3A2F",
        tabBarInactiveTintColor: "#9E9589",
        tabBarStyle: {
          backgroundColor: "#fff",
          borderTopColor: "#D8D1C7",
          borderTopWidth: 1,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: "500" },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => <TabIcon name="home" color={color} />,
        }}
      />
      <Tabs.Screen
        name="pets"
        options={{
          title: "Pets",
          tabBarIcon: ({ color }) => <TabIcon name="paw" color={color} />,
        }}
      />
      <Tabs.Screen
        name="assistente"
        options={{
          title: "Assistente",
          tabBarIcon: ({ color }) => (
            <TabIcon name="chatbubble-ellipses" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="clinica"
        options={{
          title: "Clínica",
          tabBarIcon: ({ color }) => (
            <TabIcon name="add-circle" color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
