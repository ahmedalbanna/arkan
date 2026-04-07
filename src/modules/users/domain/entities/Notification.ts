
import { 
    type NotificationPropertiesType as NotificationProperties 
} from "../schemas/NotificationSchema";

export type NotificationIcon = 'credit-card' | 'bot' | 'file-text' | 'user-plus' | 'default' | 'gem' | 'bell';
export type { NotificationProperties };

export class Notification implements NotificationProperties {
  public readonly id: string;
  public readonly title: string;
  public readonly description: string;
  public readonly icon: NotificationIcon;
  public readonly isRead: boolean;
  public readonly createdAt: string;
  public readonly link?: string;

  constructor(props: NotificationProperties) {
    this.id = props.id;
    this.title = props.title;
    this.description = props.description;
    this.icon = (props.icon as NotificationIcon) || 'default';
    this.isRead = !!props.isRead;
    this.createdAt = props.createdAt || new Date().toISOString();
    this.link = props.link;
  }

  /**
   * Standardized serialization to plain properties.
   */
  public toProperties(): NotificationProperties {
    return {
      id: this.id,
      title: this.title,
      description: this.description,
      icon: this.icon,
      isRead: this.isRead,
      createdAt: this.createdAt,
      link: this.link,
    };
  }

  /**
   * Compatibility alias for serialization.
   */
  public toJSON(): NotificationProperties {
    return this.toProperties();
  }

  /**
   * Standardized cloning with property updates.
   */
  public withProps(props: Partial<NotificationProperties>): Notification {
    return new Notification({
      ...this.toProperties(),
      ...props,
    });
  }
}
