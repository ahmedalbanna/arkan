export type NotificationIcon = 'credit-card' | 'bot' | 'file-text' | 'user-plus' | 'default';

export interface NotificationProperties {
  id: string;
  title: string;
  description: string;
  icon: NotificationIcon;
  isRead: boolean;
  createdAt: string;
  link?: string;
}

export class Notification {
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
    this.icon = props.icon || 'default';
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
   * Standardized cloning with property updates.
   */
  public withProps(props: Partial<NotificationProperties>): Notification {
    return new Notification({
      ...this.toProperties(),
      ...props,
    });
  }
}
