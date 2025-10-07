

'use client';

import { type AnyProjectProposal } from '@/ai/schemas';
import { useLocalization } from '@/context/LocalizationContext';
import { useTheme } from 'next-themes';
import dynamic from 'next/dynamic';
import { memo } from 'react';

const ReactJson = dynamic(() => import('@microlink/react-json-view'), { ssr: false });

interface ProposalViewerProps {
    proposal: AnyProjectProposal;
    onUpdate?: (path: string, value: any) => void;
    readOnly?: boolean;
}

const ProposalViewer = memo(function ProposalViewer({ proposal, onUpdate, readOnly = false }: ProposalViewerProps) {
    const { t } = useLocalization();
    const { resolvedTheme } = useTheme();

    if (!proposal) return null;

    return (
        <ReactJson
            src={proposal}
            theme={resolvedTheme === 'dark' ? 'monokai' : 'rjv-default'}
            displayDataTypes={false}
            name={false}
            quotesOnKeys={false}
            displayObjectSize={false}
            onEdit={!readOnly ? (edit) => {
                const path = edit.namespace.join('.');
                if (onUpdate) {
                    onUpdate(path, edit.new_value);
                }
                return true;
            } : false}
            onDelete={!readOnly ? (del) => {
                const path = del.namespace.join('.');
                if (onUpdate) {
                    onUpdate(path, undefined);
                }
                return true;
            } : false}
        />
    );
});

export default ProposalViewer;
