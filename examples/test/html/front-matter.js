'use strict';

import {assert} from 'chai';
import yaml from 'plugins/html/front-matter';
import fixture from 'test/fixture/file-gen';

it('YAML plugin should have frontMatter & contents properties', () => {
  const plugin = yaml({
    delims: '***'
  });

  plugin.on('data', file => {
    assert.deepEqual(file.frontMatter, {
      title: 'awesome'
    });
    assert.equal(file.contents.toString(), '# heading');
  });
  plugin.write(fixture(
    new Buffer('***\ntitle: awesome\n***\n# heading'),
    'test.md')
  );
});
