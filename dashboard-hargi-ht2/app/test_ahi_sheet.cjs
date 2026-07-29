const fs = require('fs');
const https = require('https');

const url = 'https://docs.google.com/spreadsheets/d/1MquufLxJD59lXOpjU2pF06aw1IhlPpVBBZ1OQXAHm7M/export?format=csv&gid=0';

https.get(url, (res) => {
  if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
    https.get(res.headers.location, (res2) => {
      let data = '';
      res2.on('data', chunk => data += chunk);
      res2.on('end', () => {
        fs.writeFileSync('ahi_mtu_sample.csv', data);
        console.log('Done, saved to ahi_mtu_sample.csv. Lines: ' + data.split('\n').length);
        const lines = data.split('\n');
        console.log('Header:');
        console.log(lines[0]);
        console.log('Row 1:');
        console.log(lines[1]);
      });
    });
  } else {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      fs.writeFileSync('ahi_mtu_sample.csv', data);
      console.log('Done, saved to ahi_mtu_sample.csv. Lines: ' + data.split('\n').length);
      const lines = data.split('\n');
      console.log('Header:');
      console.log(lines[0]);
      console.log('Row 1:');
      console.log(lines[1]);
    });
  }
});
