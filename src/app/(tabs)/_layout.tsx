import { RotaProtegida } from "@/components/RotaProtegida";
import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { useColorScheme } from "nativewind";

type NomeIcone = React.ComponentProps<typeof Ionicons>["name"];

// Aba ativa com o ícone cheio, as outras com o contorno: a aba atual se
// destaca pela forma, não só pela cor
function IconeAba({
  cheio,
  contorno,
  focado,
  color,
}: {
  cheio: NomeIcone;
  contorno: NomeIcone;
  focado: boolean;
  color: string;
}) {
  return <Ionicons name={focado ? cheio : contorno} size={24} color={color} />;
}

export default function LayoutAbas() {
  const { colorScheme } = useColorScheme();
  const escuro = colorScheme === "dark";

  return (
    <RotaProtegida>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: escuro ? "#E8A838" : "#1E3A2F",
          tabBarInactiveTintColor: escuro ? "#6B6B6B" : "#9E9589",
          tabBarStyle: {
            backgroundColor: escuro ? "#1A1A1A" : "#fff",
            borderTopColor: escuro ? "#2A2A2A" : "#D8D1C7",
            borderTopWidth: 1,
          },
          tabBarLabelStyle: { fontSize: 11, fontWeight: "600" },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Início",
            tabBarIcon: ({ color, focused }) => (
              <IconeAba cheio="home" contorno="home-outline" focado={focused} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="pets"
          options={{
            title: "Pets",
            tabBarIcon: ({ color, focused }) => (
              <IconeAba cheio="paw" contorno="paw-outline" focado={focused} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="assistente"
          options={{
            title: "Assistente",
            tabBarIcon: ({ color, focused }) => (
              <IconeAba
                cheio="chatbubble-ellipses"
                contorno="chatbubble-ellipses-outline"
                focado={focused}
                color={color}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="clinica"
          options={{
            title: "Clínica",
            // Prédio, o mesmo ícone das clínicas sem foto (o "+" parecia "adicionar")
            tabBarIcon: ({ color, focused }) => (
              <IconeAba cheio="business" contorno="business-outline" focado={focused} color={color} />
            ),
          }}
        />
      </Tabs>
    </RotaProtegida>
  );
}
