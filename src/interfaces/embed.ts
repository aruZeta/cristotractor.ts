export interface IEmbed {
  color: number,
  timestamp: string,
  author: IEmbedAuthor,
  title?: string,
  description?: string,
  url?: string,
  thumbnail?: IEmbedThumbnail,
  footer?: IEmbedFooter,
  fields?: IEmbedField[],
};

export interface IEmbedFooter {
  text: string,
  icon_url: string,
};

export interface IEmbedAuthor {
  name: string,
  url: string,
  icon_url: string,
};

export interface IEmbedThumbnail {
  url: string,
  height?: number,
  width?: number,
};

export interface IEmbedField {
  name: string,
  value: string,
  inline?: boolean,
};
