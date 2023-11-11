import { AbstractSourceFactory } from './AbstractSourceFactory/AbstractSourceFactory';

import { ComradeMaoParser } from './en/ComradeMao/ComradeMao';

const SourceFactory = new AbstractSourceFactory();

SourceFactory.registerSource(new ComradeMaoParser());

export default SourceFactory;
