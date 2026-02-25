
import { v4 as uuidv4 } from 'uuid';
import { ExternalContextType } from './ControlTypes';

export interface ExternalContextProperties {
    id?: string;
    fileName: string;
    content: string; // Could be raw text or a data URI
    type: ExternalContextType;
    metadata?: Record<string, any>; // Flexible metadata
}

export class ExternalContext implements ExternalContextProperties {
    public readonly id: string;
    public readonly fileName: string;
    public readonly content: string;
    public readonly type: ExternalContextType;
    public readonly metadata: Readonly<Record<string, any>>;

    constructor(props: ExternalContextProperties) {
        this.id = props.id || uuidv4();
        this.fileName = props.fileName;
        this.content = props.content;
        this.type = props.type;
        this.metadata = props.metadata || {};
    }

    public with(props: Partial<ExternalContextProperties>): ExternalContext {
        return new ExternalContext({
            ...this.toStateObject(),
            ...props,
        });
    }

    public toStateObject(): ExternalContextProperties {
        return {
            id: this.id,
            fileName: this.fileName,
            content: this.content,
            type: this.type,
            metadata: this.metadata,
        };
    }

    public toJSON(): ExternalContextProperties {
        return this.toStateObject();
    }
}
