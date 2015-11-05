import {assert} from 'chai';
import markup from 'plugins/html/markup';
import fixture from 'test/fixture/file-gen';

it('MARKUP file should return html string a html file extension', () => {
  const plugin = markup();

  plugin.once('data', file => {
    assert.equal(file.contents.toString(), '<h1>heading</h1>\n');
  });
  plugin.write(fixture('# heading', 'test.md'));
  plugin.end();
});
