import { Collection } from "discord.js";

export default class ComponentInteractionCache {
  public cache: Collection<string, any> = new Collection();
  private cacheTimestamps: string[] = Array();

  public add = (
    id: string,
    stuff: any
  ): void => {
    if (this.cache.size == 10) {
      this.cache.delete(this.cacheTimestamps[0]);
      this.cacheTimestamps.shift();
    };
    this.cache.set(id, stuff);
    this.cacheTimestamps.push(id);
  }

  public remove = (
    id: string,
  ): void => {
    this.cache.delete(id);
    this.cacheTimestamps.splice(this.cacheTimestamps.indexOf(id), 1);
  };
};
