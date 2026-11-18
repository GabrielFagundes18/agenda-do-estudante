/**
 * ARQUIVO: src/tipos/icones.ts
 *
 * PARA QUE SERVE?
 * Usamos os ícones "Ionicons" do pacote @expo/vector-icons. Cada ícone tem um nome
 * (ex.: "heart", "calendar-outline").
 *
 * O tipo "NomeIcone" pega a lista de nomes válidos direto do componente Ionicons.
 * Assim, se digitarmos o nome de um ícone que não existe, o editor avisa na hora.
 */
import { Ionicons } from "@expo/vector-icons";
import { ComponentProps } from "react";

export type NomeIcone = ComponentProps<typeof Ionicons>["name"];
