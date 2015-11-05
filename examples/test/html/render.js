import {assert} from 'chai';
import render from 'plugins/html/render';
import fixture from 'test/fixture/file-gen';

it('renderer should output', () => {
  const plugin = render({
    layout: 'test/fixture/test.jade',
    title: 'test title'
  });

  plugin.once('data', file => {
    assert.equal(file.path, 'test.html');
    assert.equal(file.contents.toString(),
    '<html>' +
    '<head><title>test title</title>' +
    '</head><body><h1>test title</h1>' +
    '<div>awesome</div></body>' +
    '</html>');
  });
  plugin.write(fixture('awesome', 'test.md'));
});
