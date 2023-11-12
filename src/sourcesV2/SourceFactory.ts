import { AbstractSourceFactory } from './AbstractSourceFactory/AbstractSourceFactory';

import { ComradeMaoParser } from './en/ComradeMao/ComradeMao';
import { NovelUpdatesParser } from './en/NovelUpdates/NovelUpdates';

const SourceFactory = new AbstractSourceFactory();

SourceFactory.registerSource(new ComradeMaoParser());
SourceFactory.registerSource(new NovelUpdatesParser());

export default SourceFactory;
