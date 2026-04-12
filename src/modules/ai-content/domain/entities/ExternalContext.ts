
import { ExternalContextType } from './ControlTypes';

export interface ExternalContextProperties {
    readonly id: string;
    readonly fileName: string;
    readonly content: string; // Could be raw text or a data URI
    readonly type: ExternalContextType;
    readonly metadata?: Readonly<Record<string, any>>; // Flexible metadata
    readonly createdAt?: string;
    readonly updatedAt?: string;
}

export class ExternalContext {
    public readonly id: string;
    public readonly fileName: string;
    public readonly content: string;
    public readonly type: ExternalContextType;
    public readonly metadata: Readonly<Record<string, any>>;
    public readonly createdAt?: string;
    public readonly updatedAt?: string;

    constructor(props: ExternalContextProperties) {
        this.id = props.id;
        this.fileName = props.fileName;
        this.content = props.content;
        this.type = props.type;
        this.metadata = props.metadata || {};
        this.createdAt = props.createdAt;
        this.updatedAt = props.updatedAt;
    }

    public withProps(props: Partial<ExternalContextProperties>): ExternalContext {
        return new ExternalContext({
            ...this.toProperties(),
            ...props,
        });
    }

    public toProperties(): ExternalContextProperties {
        return {
            id: this.id,
            fileName: this.fileName,
            content: this.content,
            type: this.type,
            metadata: this.metadata,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
        };
    }

    public toStateObject(): ExternalContextProperties {
        return this.toProperties();
    }

    public toJSON(): ExternalContextProperties {
        return this.toProperties();
    }
}
