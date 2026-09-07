import NativeFile from '@modules/native-file';
import { restoreNovelFiles } from '../fileSections';

jest.mock('@utils/Storages', () => ({
  NOVEL_STORAGE: '/storage/Novels',
  PLUGIN_STORAGE: '/storage/Plugins',
}));

describe('restoreNovelFiles', () => {
  it('moves downloaded files to remapped novel and chapter IDs', async () => {
    jest.mocked(NativeFile.exists).mockResolvedValue(true);
    jest.mocked(NativeFile.mkdir).mockResolvedValue(undefined);
    jest.mocked(NativeFile.moveFile).mockResolvedValue(undefined);
    jest.mocked(NativeFile.unlink).mockResolvedValue(undefined);
    jest.mocked(NativeFile.readDir).mockImplementation(async path => {
      if (path === '/staging/source/1') {
        return [
          {
            name: 'cover.png',
            path: '/staging/source/1/cover.png',
            isDirectory: false,
          },
          {
            name: '10',
            path: '/staging/source/1/10',
            isDirectory: true,
          },
          {
            name: '20',
            path: '/staging/source/1/20',
            isDirectory: true,
          },
        ];
      }
      if (path === '/staging/source/1/10') {
        return [
          {
            name: 'index.html',
            path: '/staging/source/1/10/index.html',
            isDirectory: false,
          },
        ];
      }
      return [];
    });

    await restoreNovelFiles('/staging', [
      {
        pluginId: 'source',
        backupNovelId: 1,
        restoredNovelId: 7,
        chapters: [{ backupChapterId: 10, restoredChapterId: 99 }],
      },
    ]);

    expect(NativeFile.moveFile).toHaveBeenCalledWith(
      '/staging/source/1/cover.png',
      '/storage/Novels/source/7/cover.png',
    );
    expect(NativeFile.moveFile).toHaveBeenCalledWith(
      '/staging/source/1/10/index.html',
      '/storage/Novels/source/7/99/index.html',
    );
    expect(NativeFile.moveFile).not.toHaveBeenCalledWith(
      expect.stringContaining('/20/'),
      expect.any(String),
    );
    expect(NativeFile.unlink).toHaveBeenCalledWith('/staging');
  });
});
