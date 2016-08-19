import { UdacityTransportationPage } from './app.po';

describe('udacity-transportation App', function() {
  let page: UdacityTransportationPage;

  beforeEach(() => {
    page = new UdacityTransportationPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
