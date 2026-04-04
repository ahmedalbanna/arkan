export type RewriteStyleOption = {
    label: string;
    style: string;
};

export type SectionMutationPayload = {
    text: string;
    sectionId: string;
    style?: string;
};

export type SectionMutation = {
    isPending?: boolean;
    variables?: { sectionId?: string } | null;
    mutate?: (payload: SectionMutationPayload) => void;
};

export type ComparisonSnapshot = {
    id: string;
    name: string;
    snapshotData: unknown;
};
