import { downloadTextFile } from './download';

describe('utils/download', () => {
  it('downloadTextFile()', () => {
    const mockBody = {
      elements: [] as any[],
      appendChild(element: any): void {
        this.elements.push(element);
      },
      removeChild(element: any): void {
        this.elements = this.elements.filter((e) => e !== element);
      },
    };
    Object.defineProperty(document, 'body', {
      get: () => mockBody,
    });

    const mockAnchorElement = {
      href: '',
      tagName: '',
      attributes: {} as Record<string, string>,
      style: {} as any,
      clickedInDom: false,
      setAttribute(name: string, value: string): void {
        this.attributes[name] = value;
      },
      click() {
        if (mockBody.elements.includes(this)) {
          this.clickedInDom = true;
        }
      },
    };
    jest
      .spyOn(document, 'createElement')
      .mockReturnValue(mockAnchorElement as any);

    downloadTextFile('filename.txt', 'TEST CONTENT');

    const dataUri = mockAnchorElement.attributes['href'];
    const [uriScheme, uriContent] = dataUri!.split(':');
    const [preamble, encodedText] = uriContent.split(',');
    const [mediaType, charset] = preamble.split(';');

    expect(uriScheme).toBe('data');
    expect(mediaType).toBe('text/plain');
    expect(charset).toBe('charset=utf-8');
    expect(decodeURIComponent(encodedText)).toBe('TEST CONTENT');
    expect(mockAnchorElement.attributes['download']).toBe('filename.txt');
    expect(mockAnchorElement.clickedInDom).toBe(true);
    expect(mockAnchorElement.style.display).toBe('none');
    expect(mockBody.elements.includes(mockAnchorElement)).toBeFalsy();
  });
});
