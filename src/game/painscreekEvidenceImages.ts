export type PainscreekEvidenceImage = {
  fileName: string;
  originalUrl: string;
  thumbnailUrl: string;
};

export type PainscreekEvidenceImageGroup = {
  id: string;
  title: string;
  images: PainscreekEvidenceImage[];
};

const IMAGE_ROOT = "/images/painscreek-evidence";

function imageGroup(id: string, title: string, fileNames: string[]): PainscreekEvidenceImageGroup {
  return {
    id,
    title,
    images: fileNames.map((fileName) => {
      const thumbnailName = fileName.replace(/\.png$/i, ".webp");
      return {
        fileName,
        originalUrl: `${IMAGE_ROOT}/${fileName}`,
        thumbnailUrl: `${IMAGE_ROOT}/thumbnails/${thumbnailName}`,
      };
    }),
  };
}

function sequence(prefix: string, first: number, last: number, directory = "") {
  return Array.from(
    { length: last - first + 1 },
    (_, index) => `${directory}${prefix}${first + index}.png`,
  );
}

export const PAINSCREEK_EVIDENCE_IMAGE_GROUPS: PainscreekEvidenceImageGroup[] = [
  imageGroup("andrew", "Diário — Andrew Reed", sequence("andrew", 1, 2)),
  imageGroup("bernard", "Diário — Bernard Hopkins", sequence("bernard", 1, 3)),
  imageGroup("charles", "Diário — Charles Roberts", ["charles.png", "charles1.png"]),
  imageGroup("derrick", "Diário — Derrick Tyler", sequence("derrick", 1, 10)),
  imageGroup("dorothy", "Diário — Dorothy Patterson", [
    "Dorothy.png",
    ...sequence("Dorothy", 1, 4),
  ]),
  imageGroup("james", "Diário — James Howard", ["james.png", ...sequence("james", 1, 2)]),
  imageGroup("mary", "Diário — Mary Martinez", ["mary.png", ...sequence("mary", 1, 6)]),
  imageGroup("matthew", "Diário — Matthew Brooks", sequence("matthew", 1, 7)),
  imageGroup("scott", "Diário — Scott Brooks", sequence("scott", 1, 23)),
  imageGroup("steven", "Anotações — Steven Moss", ["steven.png", ...sequence("steven", 1, 4)]),
  imageGroup("trisha", "Diário — Trisha Roberts", ["trisha.png", ...sequence("trisha", 1, 9)]),
  imageGroup("vivian", "Diário — Vivian Roberts", ["vivian.png", ...sequence("vivian", 1, 4)]),
  imageGroup("wanda", "Diário — Wanda Tyler", ["wanda.png", ...sequence("wanda", 1, 3)]),
  imageGroup("newspapers", "Recortes de jornal — série jornal", sequence("jornal", 1, 7)),
  imageGroup("documents", "Documentos — série doc", sequence("doc", 1, 16)),
  imageGroup("other", "Outros — série de imagens", sequence("outros", 1, 7)),
];

export const PAINSCREEK_EVIDENCE_IMAGE_COUNT = PAINSCREEK_EVIDENCE_IMAGE_GROUPS.reduce(
  (total, group) => total + group.images.length,
  0,
);
