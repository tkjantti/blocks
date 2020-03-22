/*
 * Copyright (c) 2019, 2020 Tero Jäntti, Sami Heikkinen
 *
 * Permission is hereby granted, free of charge, to any person
 * obtaining a copy of this software and associated documentation
 * files (the "Software"), to deal in the Software without
 * restriction, including without limitation the rights to use, copy,
 * modify, merge, publish, distribute, sublicense, and/or sell copies
 * of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS
 * BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN
 * ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

const STORAGE_ID_HIGHSCORE = "blocks-highscore";

const LIST_LENGTH = 6;

const DEFAULT_NAMES = [
  { name: "Mighty Monster", score: 50401 },
  { name: "SuperVillain", score: 23701 },
  { name: "Cuddly Kitten", score: 10002 },
  { name: "Bobby the Bug", score: 998 }
];

export class HighScoreList {
  constructor(list) {
    this.list = list;
  }

  static load() {
    const data = localStorage.getItem(STORAGE_ID_HIGHSCORE);
    const list = data ? JSON.parse(data) : DEFAULT_NAMES;
    return new HighScoreList(list);
  }

  save() {
    const data = JSON.stringify(this.list);
    localStorage.setItem(STORAGE_ID_HIGHSCORE, data);
  }

  add(entry) {
    this.list.push(entry);
    this.list.sort((a, b) => b.score - a.score);
    this.list.splice(LIST_LENGTH);
  }
}
