import type { ScheduleState } from '../types';

const SEED_WEEK = '2026-03-16';

/** Seed data - Week of March 16-22 */
export const SEED_SCHEDULE: ScheduleState = {
  currentWeekStart: SEED_WEEK,
  roles: [
    { id: 'server', label: 'SERVER', staff: [
      { id: 's_server_ana', name: 'Ana' }, { id: 's_server_pamela', name: 'Pamela' },
      { id: 's_server_eloy', name: 'Eloy' }, { id: 's_server_raul', name: 'Raul' },
      { id: 's_server_abigail', name: 'Abigail' }, { id: 's_server_julic', name: 'Juli-C' },
      { id: 's_server_julib', name: 'Juli-B' }, { id: 's_server_kiara', name: 'Kiara' },
      { id: 's_server_isaias', name: 'Isaias' }, { id: 's_server_valerie', name: 'Valerie' },
      { id: 's_server_stephanie', name: 'Stephanie' }, { id: 's_server_pablo', name: 'Pablo' },
      { id: 's_server_jasmine', name: 'Jasmine' }, { id: 's_server_melanie', name: 'Melanie' },
      { id: 's_server_jennifer', name: 'Jennifer' }, { id: 's_server_cecilia', name: 'Cecilia' },
    ]},
    { id: 'host', label: 'HOST', staff: [] },
    { id: 'bartender', label: 'BAR', staff: [
      { id: 's_bar_molina', name: 'Molina' }, { id: 's_bar_angel', name: 'Angel' },
      { id: 's_bar_monica', name: 'Monica' }, { id: 's_bar_miguel', name: 'Miguel' },
      { id: 's_bar_valene', name: 'Valene' }, { id: 's_bar_pablo', name: 'Pablo' },
      { id: 's_bar_isaias', name: 'Isaias' }, { id: 's_bar_cecilia', name: 'Cecilia' },
    ]},
    { id: 'busser', label: 'BUSSER', staff: [] },
  ],
  weekSchedules: {
    [SEED_WEEK]: {
      shifts: {
        server_s_server_ana: { fri: { timeRange: '5-11', suffix: 'P' }, sat: { timeRange: '5-11', suffix: 'R' }, sun: { timeRange: '11-11G, P' } },
        server_s_server_pamela: { wed: { timeRange: '5-11', suffix: 'G' }, thu: { timeRange: '5-11', suffix: 'P' }, fri: { timeRange: '5-11', suffix: 'R' }, sat: { timeRange: '5-11', suffix: 'P' }, sun: { timeRange: '11-5', suffix: 'Y' } },
        server_s_server_eloy: { sat: { timeRange: '11-11P, G' }, sun: { timeRange: '11-11B, Y' } },
        server_s_server_raul: { wed: { timeRange: '11-5', suffix: 'G' }, thu: { timeRange: '11-5', suffix: 'R' }, sat: { timeRange: '5-11', suffix: 'O' }, sun: { timeRange: '11-11P, G' } },
        server_s_server_abigail: { mon: { timeRange: 'RO' }, tue: { timeRange: '5-11', suffix: 'O' }, wed: { timeRange: '5-11', suffix: 'P' }, fri: { timeRange: '11-5', suffix: 'R' }, sat: { timeRange: '11-5', suffix: 'G' }, sun: { timeRange: '11-11R, O' } },
        server_s_server_julic: { mon: { timeRange: '11-11', suffix: 'RR' }, tue: { timeRange: '5-11', suffix: 'P' }, thu: { timeRange: '11-5', suffix: 'G' }, fri: { timeRange: '5-11', suffix: 'Y' }, sat: { timeRange: '11-5', suffix: 'R' } },
        server_s_server_julib: { thu: { timeRange: '5-11', suffix: 'G' }, fri: { timeRange: '11-5', suffix: 'P' }, sat: { timeRange: '11-5', suffix: 'O' }, sun: { timeRange: '11-5', suffix: 'O' } },
        server_s_server_kiara: { mon: { timeRange: '11-11G, O' }, wed: { timeRange: '5-11', suffix: 'R' }, fri: { timeRange: '5-11', suffix: 'B' }, sat: { timeRange: '5-11', suffix: 'Y' }, sun: { timeRange: '5-11', suffix: 'R' } },
        server_s_server_isaias: { wed: { timeRange: '5-11', suffix: 'O' }, thu: { timeRange: '5-11', suffix: 'R' }, fri: { timeRange: '5-11', suffix: 'O' }, sat: { timeRange: '5-11', suffix: 'B' } },
        server_s_server_valerie: { mon: { timeRange: '5-11', suffix: 'G' }, tue: { timeRange: '5-11', suffix: 'R' }, thu: { timeRange: '11-5', suffix: 'P' }, fri: { timeRange: 'RO' }, sat: { timeRange: 'RO' }, sun: { timeRange: 'BAR' } },
        server_s_server_stephanie: { mon: { timeRange: 'RO' }, tue: { timeRange: '11-5', suffix: 'R' }, wed: { timeRange: '11-5', suffix: 'P' } },
        server_s_server_pablo: { mon: { timeRange: '11-5', suffix: 'P' }, tue: { timeRange: '5-11', suffix: 'G' }, wed: { timeRange: '11-5', suffix: 'R' }, fri: { timeRange: '11-5O, BAR 5-11' }, sun: { timeRange: 'BAR' } },
        server_s_server_jasmine: { mon: { timeRange: '5-11', suffix: 'P' }, sun: { timeRange: '5-11', suffix: 'B' } },
        server_s_server_melanie: { tue: { timeRange: 'RO' }, wed: { timeRange: 'RO' }, thu: { timeRange: '5-11', suffix: 'O' }, fri: { timeRange: '5-11', suffix: 'G' }, sat: { timeRange: 'H' } },
        server_s_server_jennifer: { tue: { timeRange: '11-5', suffix: 'G' } },
        server_s_server_cecilia: { tue: { timeRange: '11-5', suffix: 'P' } },
        bartender_s_bar_molina: { mon: { timeRange: '5-11' }, tue: { timeRange: '11-5' }, thu: { timeRange: '5-11' }, sat: { timeRange: '5-11' } },
        bartender_s_bar_angel: { wed: { timeRange: '5-11' } },
        bartender_s_bar_monica: { tue: { timeRange: '5-11' }, wed: { timeRange: '11-5' }, fri: { timeRange: '5-11' }, sat: { timeRange: '5-11' }, sun: { timeRange: '11-5' } },
        bartender_s_bar_miguel: { mon: { timeRange: '11-5' }, thu: { timeRange: '11-5' }, sat: { timeRange: '11-5' }, sun: { timeRange: '5-11' } },
        bartender_s_bar_valene: { sun: { timeRange: '11-5' } },
        bartender_s_bar_pablo: { fri: { timeRange: '5-11' }, sun: { timeRange: '5-11' } },
        bartender_s_bar_cecilia: { wed: { timeRange: '5' }, sat: { timeRange: '11-5' } },
      },
      headcounts: {
        server: { mon: { morning: 3, night: 4 }, tue: { morning: 3, night: 4 }, wed: { morning: 3, night: 4 }, thu: { morning: 3, night: 4 }, fri: { morning: 4, night: 6 }, sat: { morning: 4, night: 6 }, sun: { morning: 6, night: 6 } },
        host: { mon: { morning: 2, night: 2 }, tue: { morning: 2, night: 2 }, wed: { morning: 2, night: 2 }, thu: { morning: 2, night: 2 }, fri: { morning: 2, night: 3 }, sat: { morning: 2, night: 3 }, sun: { morning: 2, night: 3 } },
        bartender: { mon: { morning: 1, night: 1 }, tue: { morning: 1, night: 1 }, wed: { morning: 1, night: 1 }, thu: { morning: 1, night: 1 }, fri: { morning: 1, night: 2 }, sat: { morning: 2, night: 2 }, sun: { morning: 2, night: 2 } },
        busser: { mon: { morning: 1, night: 2 }, tue: { morning: 1, night: 2 }, wed: { morning: 1, night: 2 }, thu: { morning: 1, night: 2 }, fri: { morning: 2, night: 3 }, sat: { morning: 2, night: 3 }, sun: { morning: 2, night: 3 } },
      },
    },
  },
};
