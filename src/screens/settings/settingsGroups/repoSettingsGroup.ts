import { repoIds, SettingsGroup } from '../Settings';

const RepoSettings: SettingsGroup<repoIds> = {
  groupTitle: 'Repositories',
  icon: 'github',
  navigateParam: 'RepoSettings',
  subGroup: [
    {
      subGroupTitle: '',
      id: '',
      settings: [
        {
          type: 'Repo',
        },
      ],
    },
  ],
};
export default RepoSettings;
