import { RotaProtegida } from "@/components/RotaProtegida";
import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";

type NomeIcone = React.ComponentProps<typeof Ionicons>["name"];

function IconeAba({ name, color }: { name: NomeIcone; color: string }) {
  return <Ionicons name={name} size={24} color={color} />;
}

export default function LayoutAbas() {
  return (
    <RotaProtegida>
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
            title: "Início",
            tabBarIcon: ({ color }) => <IconeAba name="home" color={color} />,
          }}
        />
        <Tabs.Screen
          name="pets"
          options={{
            title: "Pets",
            tabBarIcon: ({ color }) => <IconeAba name="paw" color={color} />,
          }}
        />
        <Tabs.Screen
          name="assistente"
          options={{
            title: "Assistente",
            tabBarIcon: ({ color }) => (
              <IconeAba name="chatbubble-ellipses" color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="clinica"
          options={{
            title: "Clínica",
            tabBarIcon: ({ color }) => (
              <IconeAba name="add-circle" color={color} />
            ),
          }}
        />
      </Tabs>
    </RotaProtegida>
  );
}
