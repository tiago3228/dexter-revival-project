import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { Game } from "@/game/Game";
import { validateHomeSearch } from "@/game/vivianCaseNavigation";

const pageTitle = "Dexter — The Game | Investigação Criminal";
const pageDescription =
  "Entre no universo de Dexter Morgan, investigue cenas de crime, reúna evidências e descubra a verdade.";
const siteUrl = "https://dexter-the-game.lovable.app/";
const socialImage = "https://dexter-the-game.lovable.app/images/og-dexter.jpg";

export const Route = createFileRoute("/")({
  validateSearch: validateHomeSearch,
  head: () => ({
    meta: [
      { title: pageTitle },
      { name: "description", content: pageDescription },
      { property: "og:title", content: pageTitle },
      { property: "og:description", content: pageDescription },
      { property: "og:image", content: socialImage },
      { property: "og:image:type", content: "image/jpeg" },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      {
        property: "og:image:alt",
        content: "Arte oficial de Dexter — The Game em preto, branco e vermelho.",
      },
      { property: "og:url", content: siteUrl },
      { property: "og:site_name", content: "Dexter — The Game" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: pageTitle },
      { name: "twitter:description", content: pageDescription },
      { name: "twitter:image", content: socialImage },
      {
        name: "twitter:image:alt",
        content: "Arte oficial de Dexter — The Game em preto, branco e vermelho.",
      },
    ],
    links: [{ rel: "canonical", href: siteUrl }],
  }),
  component: IndexPage,
});

function IndexPage() {
  const { resumeVivian } = Route.useSearch();
  const navigate = Route.useNavigate();

  useEffect(() => {
    if (resumeVivian) {
      void navigate({
        search: (previous) => ({ ...previous, resumeVivian: undefined }),
        replace: true,
      });
    }
  }, [navigate, resumeVivian]);

  return <Game resumeVivianCase={Boolean(resumeVivian)} />;
}
